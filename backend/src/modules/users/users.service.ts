import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { email } });
	}

	findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { id } });
	}

	findByIdWithMemberships(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			include: {
				memberships: {
					include: { workspace: true },
				},
			},
		});
	}

	async getMe(userId: string, workspaceId: string) {
		const membership = await this.prisma.workspaceMember.findUnique({
			where: { userId_workspaceId: { userId, workspaceId } },
			include: {
				user: true,
				workspace: {
					include: { subscription: true },
				},
			},
		});

		if (!membership) {
			throw new NotFoundException('User or workspace not found');
		}

		const { user, workspace, role } = membership;
		const subscription = workspace.subscription;

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			emailVerifiedAt: user.emailVerifiedAt,
			workspace: {
				id: workspace.id,
				name: workspace.name,
				slug: workspace.slug,
			},
			role,
			subscription: {
				plan: subscription?.plan ?? 'FREE',
				status: subscription?.status ?? 'TRIALING',
				currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
			},
		};
	}
}
