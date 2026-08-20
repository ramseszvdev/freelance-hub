'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const [status, setStatus] = useState<Status>('loading');
	const [message, setMessage] = useState('');

	useEffect(() => {
		if (!token) {
			setStatus('error');
			setMessage('Falta el token de verificación en el enlace');
			return;
		}

		fetch('/api/backend/auth/verify-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token }),
		})
			.then(async (res) => {
				const body = await res.json();
				if (!res.ok)
					throw new Error(body.message ?? 'No se pudo verificar el email');
				setStatus('success');
			})
			.catch((err) => {
				setStatus('error');
				setMessage(
					err instanceof Error
						? err.message
						: 'Error al verificar el email'
				);
			});
	}, [token]);

	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12 sm:px-6">
			{/* Luz de fondo en tono dorado/verde */}
			<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-112.5 w-112.5 rounded-full bg-brass/10 blur-[120px]" />

			<div className="relative w-full max-w-md">
				{/* Contenedor Principal */}
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center backdrop-blur-xl shadow-2xl">
					{/* ESTADO: CARGANDO */}
					{status === 'loading' && (
						<div className="py-6">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-neutral-950 shadow-inner">
								<Loader2
									size={32}
									className="animate-spin text-brass"
								/>
							</div>
							<h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
								Verifying your account
							</h1>
							<p className="mt-2 text-sm text-neutral-400">
								Please wait a few seconds while we validate your data...
							</p>
						</div>
					)}

					{status === 'success' && (
						<div>
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
								<CheckCircle2 size={32} />
							</div>
							<h1 className="mt-6 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
								¡Email verified!
							</h1>
							<p className="mt-2 text-sm text-neutral-400">
								Your account is now fully active. You can now start
								managing your projects.
							</p>

							<div className="mt-8 pt-2">
								<Link
									href="/dashboard"
									className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98]"
								>
									<span>Go to dashboard</span>
									<ArrowRight
										size={16}
										className="transition-transform group-hover:translate-x-1"
									/>
								</Link>
							</div>
						</div>
					)}

					{/* ESTADO: ERROR */}
					{status === 'error' && (
						<div>
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
								<XCircle size={32} />
							</div>
							<h1 className="mt-6 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
								Could not verify
							</h1>
							<p className="mt-2 text-sm text-neutral-400 wrap-break-word">
								{message}
							</p>

							<div className="mt-8 pt-2">
								<Link
									href="/dashboard"
									className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98]"
								>
									<span>Back to dashboard</span>
									<ArrowRight
										size={16}
										className="transition-transform group-hover:translate-x-1"
									/>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
