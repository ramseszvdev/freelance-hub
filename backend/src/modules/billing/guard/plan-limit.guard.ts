import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { LIMIT_RESOURCE_KEY } from '../decorators/limit-resource.decorator';
import {
	LimitedResource,
	PlanName,
	PLAN_LIMITS,
} from '../config/plan-limits.config';

@Injectable()
export class PlanLimitGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const resource = this.reflector.getAllAndOverride<
			LimitedResource | undefined
		>(LIMIT_RESOURCE_KEY, [context.getHandler(), context.getClass()]);

		// If the endpoint isn't marked with @LimitResource(), no limit applies.
		if (!resource) return true;

		const request = context.switchToHttp().getRequest();
		const user = request.user as JwtPayload;

		const subscription = await this.prisma.subscription.findUnique({
			where: { workspaceId: user.workspaceId },
		});

		const plan = (subscription?.plan ?? 'FREE') as PlanName;
		const limit = PLAN_LIMITS[plan][resource];

		// Unlimited (PRO/BUSINESS) — no need to even count, avoids a query..
		if (limit === Number.POSITIVE_INFINITY) return true;

		const currentCount = await this.countResource(resource, user.workspaceId);

		if (currentCount >= limit) {
			throw new ForbiddenException(
				`You reached the limit of your ${plan} plan (${limit} ${resource}). Upgrade your plan to continue.`
			);
		}

		return true;
	}

	/**
	 * Maps each type of limited resource to its count query.
	 * Adding a new resource (e.g., 'invoices') requires a case here
	 * in addition to the entry in plan-limits.config.ts.
	 */
	private countResource(
		resource: LimitedResource,
		workspaceId: string
	): Promise<number> {
		switch (resource) {
			case 'clients':
				return this.prisma.client.count({ where: { workspaceId } });
			case 'projects':
				return this.prisma.project.count({ where: { workspaceId } });
			default:
				return Promise.resolve(0);
		}
	}
}
