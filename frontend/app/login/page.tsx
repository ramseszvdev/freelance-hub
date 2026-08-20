'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/lib/validation/auth';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginInput) => {
		setServerError(null);

		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const body = await response.json();
			setServerError(body.message ?? 'Could not log in');
			return;
		}

		const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
		router.push(redirectTo);
		router.refresh();
	};

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-6 text-neutral-100 selection:bg-brass selection:text-neutral-950">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

			<div className="absolute -top-32 -left-32 h-112.5 w-112.5 rounded-full bg-brass/10 blur-[130px] pointer-events-none" />
			<div className="absolute -bottom-32 -right-32 h-112.5 w-112.5 rounded-full bg-ledger-green/10 blur-[130px] pointer-events-none" />

			<div className="relative w-full max-w-md">
				<div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-brass/30 via-white/10 to-brass/20 blur-xl opacity-70" />

				<div className="relative rounded-3xl border border-white/10 bg-neutral-900/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
					<Link
						href="/"
						className="group inline-flex items-center gap-2 font-display text-xl font-black tracking-tight text-white transition-opacity hover:opacity-90"
					>
						<span className="inline-block h-3 w-3 bg-brass transition-transform duration-300 group-hover:rotate-45 group-hover:scale-125" />
						Freelance Hub
					</Link>

					<div className="mt-8">
						<h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
							Welcome again
						</h1>
						<p className="mt-2 text-sm text-neutral-400">
							Enter your workspace
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 space-y-6"
					>
						<div className="space-y-4">
							<Field
								label="Email"
								id="email"
								type="email"
								error={errors.email?.message}
								{...register('email')}
							/>

							<div>
								<Field
									label="Password"
									id="password"
									type="password"
									error={errors.password?.message}
									{...register('password')}
								/>
								<div className="mt-2 flex justify-end">
									<Link
										href="/forgot-password"
										className="text-xs font-medium text-neutral-400 transition-colors hover:text-brass hover:underline"
									>
										Did you forget your password?
									</Link>
								</div>
							</div>
						</div>

						{serverError && (
							<div className="relative rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-md flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
								<span>{serverError}</span>
							</div>
						)}

						<div className="pt-2">
							<SubmitButton loading={isSubmitting}>Log in</SubmitButton>
						</div>
					</form>

					{/* Footer de la tarjeta */}
					<p className="mt-8 text-center text-sm text-neutral-400">
						Do you have an account?{' '}
						<Link
							href="/register"
							className="font-bold text-white transition-colors hover:text-brass hover:underline"
						>
							Register for free
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
