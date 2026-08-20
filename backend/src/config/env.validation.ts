import { z } from 'zod';

/**
 * Environment variables validation scheme.
 * If any required variable is missing or has an invalid format,
 * the application fails to start with a clear message,
 * instead of failing at runtime in production.
 */
export const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),

	PORT: z.coerce.number().int().positive().default(3001),

	// Database
	DATABASE_URL: z.string().url(),

	// JWT
	JWT_ACCESS_SECRET: z
		.string()
		.min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
	JWT_ACCESS_EXPIRATION: z.string().default('15m'),
	JWT_REFRESH_SECRET: z
		.string()
		.min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
	JWT_REFRESH_EXPIRATION: z.string().default('7d'),

	// Stripe
	STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
	STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
	STRIPE_PRICE_ID_PRO: z.string().startsWith('price_'),
	STRIPE_PRICE_ID_BUSINESS: z.string().startsWith('price_'),

	// Transactional email (Resend)
	RESEND_API_KEY: z.string().startsWith('re_'),
	EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),

	// Frontend (for CORS and links in emails/checkout)
	FRONTEND_URL: z.string().url().default('http://localhost:3000'),

	// Rate limiting
	THROTTLE_TTL: z.coerce.number().default(60),
	THROTTLE_LIMIT: z.coerce.number().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
	const result = envSchema.safeParse(config);

	if (!result.success) {
		const formatted = result.error.issues
			.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
			.join('\n');

		throw new Error(
			`❌ Invalid environment variables:\n${formatted}\n\nPlease check your .env file`
		);
	}

	return result.data;
}
