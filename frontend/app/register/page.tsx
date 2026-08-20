'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/lib/validation/auth';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterInput) => {
		setServerError(null);

		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const body = await response.json();
			setServerError(body.message ?? 'Could not create the account');
			return;
		}

		router.push('/dashboard');
		router.refresh();
	};

	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12 sm:px-6">
			<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-brass/10 blur-[120px]" />

			<div className="relative w-full max-w-md">
				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/"
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
					<div>
						<h1 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
							Start for free
						</h1>
						<p className="mt-1.5 text-sm text-neutral-400">
							3 clients for free, without credit card
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-6 space-y-4"
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="min-w-0">
								<Field
									label="Nombre"
									id="firstName"
									error={errors.firstName?.message}
									{...register('firstName')}
								/>
							</div>
							<div className="min-w-0">
								<Field
									label="Last name"
									id="lastName"
									error={errors.lastName?.message}
									{...register('lastName')}
								/>
							</div>
						</div>

						<div className="min-w-0">
							<Field
								label="Workspace"
								id="workspaceName"
								placeholder="e.g., Creative Studio"
								error={errors.workspaceName?.message}
								{...register('workspaceName')}
							/>
						</div>

						<div className="min-w-0">
							<Field
								label="Email"
								id="email"
								type="email"
								placeholder="your@email.com"
								error={errors.email?.message}
								{...register('email')}
							/>
						</div>

						<div className="min-w-0">
							<Field
								label="Password"
								id="password"
								type="password"
								placeholder="••••••••"
								error={errors.password?.message}
								{...register('password')}
							/>
						</div>

						{serverError && (
							<div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 backdrop-blur-md">
								<AlertCircle size={16} className="shrink-0" />
								<span className="wrap-break-word">{serverError}</span>
							</div>
						)}

						<div className="pt-2">
							<SubmitButton loading={isSubmitting}>
								Create account
							</SubmitButton>
						</div>
					</form>

					<p className="mt-6 text-center text-xs text-neutral-400">
						Do you have an account?{' '}
						<Link
							href="/login"
							className="font-bold text-white transition-colors hover:text-brass hover:underline"
						>
							Log in
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
