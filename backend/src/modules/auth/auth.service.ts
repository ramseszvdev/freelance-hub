import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { EnvConfig } from '../../config/env.validation';

const BCRYPT_SALT_ROUNDS = 12;

const REFRESH_GRACE_PERIOD_MS = 10_000;
const PASSWORD_RESET_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora
const EMAIL_VERIFICATION_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		private readonly mailService: MailService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<EnvConfig, true>
	) {}

	async register(dto: RegisterDto): Promise<TokenPair> {
		const existing = await this.usersService.findByEmail(dto.email);
		if (existing) {
			throw new ConflictException(
				'An account with this email already exists'
			);
		}

		const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

		const { user, workspace, role } = await this.prisma.$transaction(
			async (tx) => {
				const user = await tx.user.create({
					data: {
						email: dto.email,
						passwordHash,
						firstName: dto.firstName,
						lastName: dto.lastName,
					},
				});

				const workspace = await tx.workspace.create({
					data: {
						name: dto.workspaceName,
						slug: this.slugify(dto.workspaceName),
					},
				});

				const membership = await tx.workspaceMember.create({
					data: {
						userId: user.id,
						workspaceId: workspace.id,
						role: 'OWNER',
					},
				});

				await tx.subscription.create({
					data: {
						workspaceId: workspace.id,
						plan: 'FREE',
						status: 'TRIALING',
					},
				});

				return { user, workspace, role: membership.role };
			}
		);

		void this.createAndSendVerificationEmail(
			user.id,
			user.email,
			user.firstName
		);

		return this.issueTokenPair(
			{ sub: user.id, email: user.email, workspaceId: workspace.id, role },
			randomUUID() // new token family — kicks off the chain from this login
		);
	}

	async requestPasswordReset(email: string): Promise<void> {
		const user = await this.usersService.findByEmail(email);

		// We don’t reveal whether the email exists or not — same success message
		// in both cases, to prevent someone from listing registered emails.
		if (!user) return;

		const rawToken = randomUUID() + randomUUID();
		const tokenHash = this.hashToken(rawToken);
		const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MS);

		await this.prisma.passwordResetToken.create({
			data: { tokenHash, userId: user.id, expiresAt },
		});

		await this.mailService.sendPasswordResetEmail(
			user.email,
			user.firstName,
			rawToken
		);
	}

	async resetPassword(rawToken: string, newPassword: string): Promise<void> {
		const tokenHash = this.hashToken(rawToken);

		const stored = await this.prisma.passwordResetToken.findUnique({
			where: { tokenHash },
			include: { user: true },
		});

		if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
			throw new UnauthorizedException(
				'The recovery link is invalid or expired'
			);
		}

		const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: stored.userId },
				data: { passwordHash },
			}),
			this.prisma.passwordResetToken.update({
				where: { id: stored.id },
				data: { usedAt: new Date() },
			}),
			this.prisma.refreshToken.updateMany({
				where: { userId: stored.userId, revokedAt: null },
				data: { revokedAt: new Date() },
			}),
		]);

		void this.mailService.sendPasswordChangedEmail(
			stored.user.email,
			stored.user.firstName
		);
	}

	async verifyEmail(rawToken: string): Promise<void> {
		const tokenHash = this.hashToken(rawToken);

		const stored = await this.prisma.emailVerificationToken.findUnique({
			where: { tokenHash },
			include: { user: true },
		});

		if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
			throw new UnauthorizedException(
				'Verification link is invalid or expired'
			);
		}

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: stored.userId },
				data: { emailVerifiedAt: new Date() },
			}),
			this.prisma.emailVerificationToken.update({
				where: { id: stored.id },
				data: { usedAt: new Date() },
			}),
		]);

		void this.mailService.sendEmailVerifiedConfirmation(
			stored.user.email,
			stored.user.firstName
		);
	}

	async resendVerificationEmail(userId: string): Promise<void> {
		const user = await this.usersService.findById(userId);
		if (!user || user.emailVerifiedAt) return;

		await this.createAndSendVerificationEmail(
			user.id,
			user.email,
			user.firstName
		);
	}

	private async createAndSendVerificationEmail(
		userId: string,
		email: string,
		firstName: string
	): Promise<void> {
		const rawToken = randomUUID() + randomUUID();
		const tokenHash = this.hashToken(rawToken);
		const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_MS);

		await this.prisma.emailVerificationToken.create({
			data: { tokenHash, userId, expiresAt },
		});

		await this.mailService.sendVerificationEmail(email, firstName, rawToken);
	}

	async login(dto: LoginDto): Promise<TokenPair> {
		const foundUser = await this.usersService.findByEmail(dto.email);
		const user = foundUser
			? await this.usersService.findByIdWithMemberships(foundUser.id)
			: null;

		const invalidCredentials = new UnauthorizedException(
			'Email or password is incorrect'
		);

		if (!user) throw invalidCredentials;

		const passwordMatches = await bcrypt.compare(
			dto.password,
			user.passwordHash
		);
		if (!passwordMatches) throw invalidCredentials;

		const primaryMembership =
			user.memberships.find((m) => m.role === 'OWNER') ??
			user.memberships[0];

		if (!primaryMembership) {
			throw new UnauthorizedException(
				'User does not have a workspace associated'
			);
		}

		return this.issueTokenPair(
			{
				sub: user.id,
				email: user.email,
				workspaceId: primaryMembership.workspaceId,
				role: primaryMembership.role,
			},
			randomUUID() // every login is a new and independent family
		);
	}

	async refresh(refreshToken: string): Promise<TokenPair> {
		let decoded: JwtPayload;
		try {
			decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
				secret: this.configService.get('JWT_REFRESH_SECRET', {
					infer: true,
				}),
			});
		} catch {
			throw new UnauthorizedException('Refresh token is invalid or expired');
		}

		const payload: JwtPayload = {
			sub: decoded.sub,
			email: decoded.email,
			workspaceId: decoded.workspaceId,
			role: decoded.role,
		};

		const tokenHash = this.hashToken(refreshToken);
		const stored = await this.prisma.refreshToken.findUnique({
			where: { tokenHash },
		});

		if (!stored || stored.expiresAt < new Date()) {
			throw new UnauthorizedException('Refresh token is invalid or expired');
		}

		// Normal case: the token is active, unused. We rotate it cleanly.
		if (!stored.revokedAt) {
			return this.rotateToken(stored.id, stored.familyId, payload);
		}

		// The token has already been used/revoked before. Was it just recently
		// (likely a race condition) or a while ago (likely theft)?
		const msSinceRevoked = Date.now() - stored.revokedAt.getTime();

		if (msSinceRevoked <= REFRESH_GRACE_PERIOD_MS) {
			// Within the grace period: we treat it as valid and
			// emit another rotation of the SAME family, without penalizing.
			return this.rotateToken(stored.id, stored.familyId, payload);
		}

		// Outside the grace period: this is no longer a race condition,
		// but a real reuse of an old token — possible theft.
		// We revoke the entire family, forcing a new login.
		await this.prisma.refreshToken.updateMany({
			where: { familyId: stored.familyId, revokedAt: null },
			data: { revokedAt: new Date() },
		});

		throw new UnauthorizedException(
			'Invalid session — for security, please log in again'
		);
	}

	async logout(userId: string, refreshToken: string): Promise<void> {
		const tokenHash = this.hashToken(refreshToken);
		const stored = await this.prisma.refreshToken.findUnique({
			where: { tokenHash },
		});

		if (!stored || stored.userId !== userId) return;

		// Logout revokes the entire family, not just the current token — it closes
		// the full session, including any pending rotation.
		await this.prisma.refreshToken.updateMany({
			where: { familyId: stored.familyId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
	}

	private async rotateToken(
		oldTokenId: string,
		familyId: string,
		payload: JwtPayload
	): Promise<TokenPair> {
		const tokens = await this.issueTokenPair(payload, familyId);

		// Links the old token with the new one — allows, within the grace period,
		// to understand that a late request on the old one
		// actually corresponds to this rotation.
		const newTokenHash = this.hashToken(tokens.refreshToken);
		const newToken = await this.prisma.refreshToken.findUnique({
			where: { tokenHash: newTokenHash },
		});

		if (newToken) {
			await this.prisma.refreshToken.update({
				where: { id: oldTokenId },
				data: { revokedAt: new Date(), replacedById: newToken.id },
			});
		}

		return tokens;
	}

	private async issueTokenPair(
		payload: JwtPayload,
		familyId: string
	): Promise<TokenPair> {
		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', {
				infer: true,
			}),
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
			expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', {
				infer: true,
			}),
		});

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		await this.prisma.refreshToken.create({
			data: {
				tokenHash: this.hashToken(refreshToken),
				userId: payload.sub,
				familyId,
				expiresAt,
			},
		});

		return { accessToken, refreshToken };
	}

	private hashToken(token: string): string {
		return createHash('sha256').update(token).digest('hex');
	}

	private slugify(name: string): string {
		const base = name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const suffix = Math.random().toString(36).slice(2, 8);
		return `${base}-${suffix}`;
	}
}
