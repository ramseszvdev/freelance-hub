/**
 * Resource limits per plan. Number.POSITIVE_INFINITY = no limit.
 *
 * To add a new limit (e.g., 'projects'), just add the key
 * here and use @LimitResource('projects') in the corresponding controller
 * — no need to touch the guard or the service.
 */
export const PLAN_LIMITS = {
	FREE: {
		clients: 3,
		projects: 2,
	},
	PRO: {
		clients: Number.POSITIVE_INFINITY,
		projects: Number.POSITIVE_INFINITY,
	},
	BUSINESS: {
		clients: Number.POSITIVE_INFINITY,
		projects: Number.POSITIVE_INFINITY,
	},
} as const;

export type LimitedResource = keyof (typeof PLAN_LIMITS)['FREE'];
export type PlanName = keyof typeof PLAN_LIMITS;
