'use client';

import { Check, Loader2 } from 'lucide-react';

interface PlanCardProps {
	name: string;
	price: string;
	features: string[];
	current: boolean;
	onUpgrade?: () => void;
	loading?: boolean;
}

export function PlanCard({
	name,
	price,
	features,
	current,
	onUpgrade,
	loading,
}: PlanCardProps) {
	return (
		<div
			className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 backdrop-blur-xl min-w-0 w-full ${
				current
					? 'border-brass/40 bg-neutral-900/80 shadow-[0_0_25px_rgba(212,175,55,0.08)]'
					: 'border-white/10 bg-neutral-900/50 hover:border-white/20'
			}`}
		>
			<div className="min-w-0">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="font-display text-lg sm:text-xl font-extrabold text-white truncate max-w-full">
						{name}
					</h3>
					{current && (
						<span className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
							Current plan
						</span>
					)}
				</div>

				<p className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight wrap-break-word">
					{price}
				</p>

				<ul className="mt-5 space-y-2.5">
					{features.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-tight"
						>
							<div className="mt-0.5 flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
								<Check size={12} strokeWidth={3} />
							</div>
							<span className="wrap-break-word min-w-0 flex-1">
								{feature}
							</span>
						</li>
					))}
				</ul>
			</div>

			{/* Botón de Acción */}
			<div className="mt-6 pt-2">
				{current ? (
					<button
						disabled
						className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-neutral-500"
					>
						Current plan
					</button>
				) : (
					onUpgrade && (
						<button
							onClick={onUpgrade}
							disabled={loading}
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 font-sans text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
						>
							{loading ? (
								<>
									<Loader2
										size={16}
										className="animate-spin text-current shrink-0"
									/>
									<span className="truncate">Redirecting...</span>
								</>
							) : (
								<span className="text-center wrap-break-word">
									Update to {name}
								</span>
							)}
						</button>
					)
				)}
			</div>
		</div>
	);
}
