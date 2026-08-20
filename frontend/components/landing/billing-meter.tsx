'use client';

import { useEffect, useState } from 'react';

const HOURLY_RATE = 45; // tarifa de ejemplo para la demo visual
const RATE_PER_MS = HOURLY_RATE / 1000 / 60 / 60;

export function BillingMeter() {
	const [elapsedMs, setElapsedMs] = useState(0);

	useEffect(() => {
		const startedAt = Date.now();
		const interval = setInterval(() => {
			setElapsedMs(Date.now() - startedAt);
		}, 87);

		return () => clearInterval(interval);
	}, []);

	const amount = (elapsedMs * RATE_PER_MS).toFixed(4);
	const totalSeconds = Math.floor(elapsedMs / 1000);
	const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
	const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
	const ss = String(totalSeconds % 60).padStart(2, '0');

	return (
		<div className="relative overflow-hidden rounded-2xl border border-brass/30 bg-neutral-900/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl shadow-brass/5">
			<div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brass/10 blur-3xl" />

			<div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400">
				<span className="relative flex h-2.5 w-2.5">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
					<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
				</span>
				<span className="truncate">Active project — Web redesign</span>
			</div>

			<div className="mt-4 font-mono text-5xl font-black tabular-nums tracking-tight text-brass drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] sm:text-6xl">
				${amount}
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
				<span className="font-mono text-xs sm:text-sm tabular-nums text-neutral-400">
					Elapsed {hh}:{mm}:{ss}
				</span>
				<span className="font-mono text-xs sm:text-sm text-neutral-500">
					${HOURLY_RATE}/h
				</span>
			</div>
		</div>
	);
}
