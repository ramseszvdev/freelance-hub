import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email('Enter a valid email'),
	password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
	firstName: z.string().min(1, 'Name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	workspaceName: z
		.string()
		.min(1, 'Name of your studio/workspace is required'),
	email: z.string().email('Enter a valid email'),
	password: z
		.string()
		.min(8, 'Al menos 8 caracteres')
		.regex(
			/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
			'Include an uppercase letter, a lowercase letter, and a number or symbol'
		),
});

export const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, 'At least 8 characters')
			.regex(
				/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
				'Include an uppercase letter, a lowercase letter, and a number or symbol'
			),
		confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
