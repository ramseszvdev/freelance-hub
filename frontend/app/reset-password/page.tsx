'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validation/auth';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const [serverError, setServerError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordInput) => {
		setServerError(null);

		if (!token) {
			setServerError(
				'The token is missing in the link — please request a new one.'
			);
			return;
		}

		const res = await fetch('/api/backend/auth/reset-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, newPassword: data.newPassword }),
		});

		if (!res.ok) {
			const body = await res.json();
			setServerError(body.message ?? 'Could not  reset the password');
			return;
		}

		setSuccess(true);
		setTimeout(() => router.push('/login'), 2000);
	};

	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12 sm:px-6">
			<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-112.5 w-112.5 rounded-full bg-brass/10 blur-[120px]" />

			<div className="relative w-full max-w-md">
				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/login"
						className="group flex items-center gap-2 text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
					>
						<ArrowLeft
							size={14}
							className="transition-transform group-hover:-translate-x-1"
						/>
						<span>Back to log in</span>
					</Link>
					<span className="font-display text-sm font-black tracking-wider text-white">
						Freelance Hub
					</span>
				</div>

				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
					{success ? (
						<div className="text-center py-2">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
								<CheckCircle2 size={28} />
							</div>
							<h1 className="mt-5 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
								Password updated!
							</h1>
							<p className="mt-2 text-sm text-neutral-400">
								Your password has been successfully reset. Redirecting
								to the login page...
							</p>
						</div>
					) : (
						<>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-950 text-brass shadow-inner">
									<Lock size={20} />
								</div>
								<div>
									<h1 className="font-display text-xl font-black tracking-tight text-white sm:text-2xl">
										New password
									</h1>
									<p className="text-xs text-neutral-400">
										Choose a secure password for your account
									</p>
								</div>
							</div>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="mt-6 space-y-4"
							>
								<div className="min-w-0">
									<Field
										label="New password"
										id="newPassword"
										type="password"
										placeholder="••••••••"
										error={errors.newPassword?.message}
										{...register('newPassword')}
									/>
								</div>

								<div className="min-w-0">
									<Field
										label="Confirm your new password"
										id="confirmPassword"
										type="password"
										placeholder="••••••••"
										error={errors.confirmPassword?.message}
										{...register('confirmPassword')}
									/>
								</div>

								{serverError && (
									<div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 backdrop-blur-md">
										<AlertCircle size={16} className="shrink-0" />
										<span className="wrap-break-word">
											{serverError}
										</span>
									</div>
								)}

								<div className="pt-2">
									<SubmitButton loading={isSubmitting}>
										Reset password
									</SubmitButton>
								</div>
							</form>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
