'use client';

import { useEffect, useState } from 'react';
import { Square, Loader2 } from 'lucide-react';

interface ActiveTimerProps {
	projectName: string;
	description: string | null;
	startedAt: string;
	hourlyRate: number | null;
	onStop: () => void;
	stopping: boolean;
}

export function ActiveTimer({
	projectName,
	description,
	startedAt,
	hourlyRate,
	onStop,
	stopping,
}: ActiveTimerProps) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 500);
		return () => clearInterval(interval);
	}, []);

	const elapsedMs = now - new Date(startedAt).getTime();
	const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
	const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
	const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
	const ss = String(totalSeconds % 60).padStart(2, '0');

	const amount = hourlyRate
		? ((elapsedMs / 1000 / 60 / 60) * hourlyRate).toFixed(4)
		: null;

	return (
		<div className="relative overflow-hidden rounded-2xl border border-brass/30 bg-neutral-900/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl shadow-brass/5">
			<div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brass/10 blur-3xl" />

			<div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
				<div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 min-w-0">
					<span className="relative flex h-2.5 w-2.5 shrink-0">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
					</span>
					<span className="truncate">{projectName}</span>
				</div>

				<button
					onClick={onStop}
					disabled={stopping}
					className="group flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
				>
					{stopping ? (
						<>
							<Loader2 size={12} className="animate-spin text-current" />
							<span>Stopping</span>
						</>
					) : (
						<>
							<Square size={12} fill="currentColor" />
							<span>Stop</span>
						</>
					)}
				</button>
			</div>

			{description && (
				<p className="mt-3 text-sm text-neutral-300 wrap-break-word leading-relaxed">
					{description}
				</p>
			)}

			{amount && (
				<div className="mt-4 font-mono text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-brass drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]">
					${amount}
				</div>
			)}

			<div className="mt-4 border-t border-white/10 pt-3">
				<span className="font-mono text-xs sm:text-sm tabular-nums text-neutral-400">
					Elapsed {hh}:{mm}:{ss}
				</span>
			</div>
		</div>
	);
}
