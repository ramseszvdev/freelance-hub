'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react';

interface ForgotPasswordInput {
	email: string;
}

export default function ForgotPasswordPage() {
	const [sent, setSent] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<ForgotPasswordInput>();

	const onSubmit = async (data: ForgotPasswordInput) => {
		await fetch('/api/backend/auth/forgot-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		setSent(true);
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
						<span>Log in again</span>
					</Link>
					<span className="font-display text-sm font-black tracking-wider text-white">
						Freelance Hub
					</span>
				</div>

				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
					{sent ? (
						<div className="text-center py-2">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
								<MailCheck size={28} />
							</div>
							<h1 className="mt-5 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
								Check your email
							</h1>
							<p className="mt-2 text-sm text-neutral-400 leading-relaxed">
								If exist an account associated with that email, you will
								receive a link with instructions to reset your password.
							</p>

							<div className="mt-8">
								<Link
									href="/login"
									className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98]"
								>
									Alright, back to login
								</Link>
							</div>
						</div>
					) : (
						<>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-950 text-brass shadow-inner">
									<KeyRound size={20} />
								</div>
								<div>
									<h1 className="font-display text-xl font-black tracking-tight text-white sm:text-2xl">
										Recover Password
									</h1>
									<p className="text-xs text-neutral-400">
										Enter your email to receive the instructions
									</p>
								</div>
							</div>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="mt-6 space-y-4"
							>
								<div className="min-w-0">
									<Field
										label="Email"
										id="email"
										type="email"
										placeholder="your@email.com"
										{...register('email', { required: true })}
									/>
								</div>

								<div className="pt-2">
									<SubmitButton loading={isSubmitting}>
										Send link
									</SubmitButton>
								</div>
							</form>

							<p className="mt-6 text-center text-xs text-neutral-400">
								Did you remember your password?{' '}
								<Link
									href="/login"
									className="font-bold text-white transition-colors hover:text-brass hover:underline"
								>
									Log in
								</Link>
							</p>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
