import { SetMetadata } from '@nestjs/common';
import { LimitedResource } from '../config/plan-limits.config';

export const LIMIT_RESOURCE_KEY = 'limitResource';

/**
 * Marks a creation endpoint so that PlanLimitGuard can check,
 * before running the handler, that the workspace hasn't exceeded the limit
 * of its plan for that type of resource.
 *
 * Usage: @LimitResource('clients') above @Post() in ClientsController.
 */
export const LimitResource = (resource: LimitedResource) =>
	SetMetadata(LIMIT_RESOURCE_KEY, resource);
