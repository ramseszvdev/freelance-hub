import Link from 'next/link';
import { XCircle, ArrowRight } from 'lucide-react';

export default function BillingCancelledPage() {
	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12 sm:px-6">
			<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-112.5 w-112.5 rounded-full bg-amber-500/10 blur-[120px]" />

			<div className="relative w-full max-w-md">
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center backdrop-blur-xl shadow-2xl">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
						<XCircle size={32} />
					</div>

					<h1 className="mt-6 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
						Payment canceled
					</h1>

					<p className="mt-2 text-sm text-neutral-400 leading-relaxed">
						No charges were made to your card. You can resume or choose
						another plan whenever you need.
					</p>

					<div className="mt-8 pt-2">
						<Link
							href="/dashboard/billing"
							className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98]"
						>
							<span>Back to plans and payments</span>
							<ArrowRight
								size={16}
								className="transition-transform group-hover:translate-x-1"
							/>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
