import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthService', () => {
	let authService: AuthService;
	let prismaMock: any;
	let usersServiceMock: any;
	let mailServiceMock: any;
	let jwtServiceMock: any;
	let configServiceMock: any;

	beforeEach(() => {
		prismaMock = {
			user: { create: jest.fn(), update: jest.fn() },
			workspace: { create: jest.fn() },
			workspaceMember: { create: jest.fn() },
			subscription: { create: jest.fn() },
			refreshToken: {
				create: jest.fn(),
				findUnique: jest.fn(),
				update: jest.fn(),
				updateMany: jest.fn(),
			},
			passwordResetToken: {
				create: jest.fn(),
				findUnique: jest.fn(),
				update: jest.fn(),
			},
			emailVerificationToken: { create: jest.fn() },
			$transaction: jest.fn((arg: any) => {
				if (Array.isArray(arg)) return Promise.all(arg);
				return arg(prismaMock);
			}),
		};

		usersServiceMock = {
			findByEmail: jest.fn(),
			findByIdWithMemberships: jest.fn(),
			findById: jest.fn(),
		};

		mailServiceMock = {
			sendVerificationEmail: jest.fn(),
			sendPasswordResetEmail: jest.fn(),
			sendPasswordChangedEmail: jest.fn(),
			sendEmailVerifiedConfirmation: jest.fn(),
		};

		jwtServiceMock = {
			sign: jest.fn().mockReturnValue('fake.jwt.token'),
			verify: jest.fn(),
		};

		configServiceMock = {
			get: jest.fn((key: string) => {
				const values: Record<string, string> = {
					JWT_ACCESS_SECRET: 'access-secret',
					JWT_ACCESS_EXPIRATION: '15m',
					JWT_REFRESH_SECRET: 'refresh-secret',
					JWT_REFRESH_EXPIRATION: '7d',
				};
				return values[key];
			}),
		};

		authService = new AuthService(
			prismaMock,
			usersServiceMock,
			mailServiceMock,
			jwtServiceMock,
			configServiceMock
		);
	});

	describe('register', () => {
		it('throw ConflictException if the email already exists', async () => {
			usersServiceMock.findByEmail.mockResolvedValue({ id: 'user-1' });

			await expect(
				authService.register({
					email: 'ana@studio.com',
					password: 'Password123!',
					firstName: 'Ana',
					lastName: 'García',
					workspaceName: "Ana's Studio",
				})
			).rejects.toThrow(ConflictException);
		});

		it('create user + workspace + membership OWNER + subscription in a transaction', async () => {
			usersServiceMock.findByEmail.mockResolvedValue(null);
			prismaMock.user.create.mockResolvedValue({
				id: 'user-1',
				email: 'ana@studio.com',
				firstName: 'Ana',
			});
			prismaMock.workspace.create.mockResolvedValue({ id: 'workspace-1' });
			prismaMock.workspaceMember.create.mockResolvedValue({ role: 'OWNER' });

			const result = await authService.register({
				email: 'ana@studio.com',
				password: 'Password123!',
				firstName: 'Ana',
				lastName: 'García',
				workspaceName: "Ana's Studio",
			});

			expect(prismaMock.workspaceMember.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ role: 'OWNER' }),
				})
			);
			expect(prismaMock.subscription.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						plan: 'FREE',
						status: 'TRIALING',
					}),
				})
			);
			expect(result).toHaveProperty('accessToken');
			expect(result).toHaveProperty('refreshToken');
		});
	});

	describe('login', () => {
		it('throw UnauthorizedException with a generic message if the user does not exist', async () => {
			usersServiceMock.findByEmail.mockResolvedValue(null);
			usersServiceMock.findByIdWithMemberships.mockResolvedValue(null);

			await expect(
				authService.login({ email: 'none@nothing.com', password: 'x' })
			).rejects.toThrow(UnauthorizedException);
		});

		it('throw UnauthorizedException if the password does not match', async () => {
			const hash = await bcrypt.hash('correct-password', 4);
			usersServiceMock.findByEmail.mockResolvedValue({ id: 'user-1' });
			usersServiceMock.findByIdWithMemberships.mockResolvedValue({
				id: 'user-1',
				email: 'ana@studio.com',
				passwordHash: hash,
				memberships: [{ role: 'OWNER', workspaceId: 'workspace-1' }],
			});

			await expect(
				authService.login({
					email: 'ana@studio.com',
					password: 'incorrect-password',
				})
			).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('refresh — rotation with a grace period', () => {
		const payload = {
			sub: 'user-1',
			email: 'ana@studio.com',
			workspaceId: 'workspace-1',
			role: 'OWNER',
		};

		beforeEach(() => {
			jwtServiceMock.verify.mockReturnValue(payload);
		});

		it('rotate a valid token normally (happy path)', async () => {
			prismaMock.refreshToken.findUnique.mockResolvedValue({
				id: 'token-1',
				familyId: 'family-1',
				revokedAt: null,
				expiresAt: new Date(Date.now() + 100_000),
			});

			const result = await authService.refresh('raw-refresh-token');

			expect(prismaMock.refreshToken.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'token-1' },
					data: expect.objectContaining({ revokedAt: expect.any(Date) }),
				})
			);
			expect(result).toHaveProperty('accessToken');
		});

		it('accept a token that has already been revoked if it is WITHIN the grace period', async () => {
			prismaMock.refreshToken.findUnique.mockResolvedValue({
				id: 'token-1',
				familyId: 'family-1',
				revokedAt: new Date(Date.now() - 2_000),
				expiresAt: new Date(Date.now() + 100_000),
			});

			const result = await authService.refresh('raw-refresh-token');

			expect(result).toHaveProperty('accessToken');
			expect(prismaMock.refreshToken.updateMany).not.toHaveBeenCalled();
		});

		it('revoke the entire family if the token is reused OUTSIDE the grace period (possible theft)', async () => {
			prismaMock.refreshToken.findUnique.mockResolvedValue({
				id: 'token-1',
				familyId: 'family-1',
				revokedAt: new Date(Date.now() - 60_000),
				expiresAt: new Date(Date.now() + 100_000),
			});

			await expect(authService.refresh('raw-refresh-token')).rejects.toThrow(
				UnauthorizedException
			);

			expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { familyId: 'family-1', revokedAt: null },
				})
			);
		});

		it('reject a token with an invalid signature', async () => {
			jwtServiceMock.verify.mockImplementation(() => {
				throw new Error('invalid signature');
			});

			await expect(authService.refresh('invalid-token')).rejects.toThrow(
				UnauthorizedException
			);
		});
	});

	describe('resetPassword', () => {
		it('throw UnauthorizedException if the token does not exist or has expired', async () => {
			prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);

			await expect(
				authService.resetPassword('invalid-token', 'NewPass123!')
			).rejects.toThrow(UnauthorizedException);
		});

		it('update the password and revokes all active sessions', async () => {
			prismaMock.passwordResetToken.findUnique.mockResolvedValue({
				id: 'reset-1',
				userId: 'user-1',
				usedAt: null,
				expiresAt: new Date(Date.now() + 100_000),
				user: { email: 'ana@studio.com', firstName: 'Ana' },
			});

			await authService.resetPassword('valid-token', 'NewPass123!');

			expect(prismaMock.user.update).toHaveBeenCalledWith(
				expect.objectContaining({ where: { id: 'user-1' } })
			);
			expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'reset-1' },
					data: expect.objectContaining({ usedAt: expect.any(Date) }),
				})
			);
			expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: 'user-1', revokedAt: null },
				})
			);
			expect(mailServiceMock.sendPasswordChangedEmail).toHaveBeenCalledWith(
				'ana@studio.com',
				'Ana'
			);
		});
	});
});
