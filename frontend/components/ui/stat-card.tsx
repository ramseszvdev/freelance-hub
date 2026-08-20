interface StatCardProps {
	label: string;
	value: string;
	hint?: string;
	accent?: 'brass' | 'green' | 'red';
}

const ACCENT_MAP = {
	brass: 'text-brass drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]',
	green: 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]',
	red: 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]',
};

export function StatCard({
	label,
	value,
	hint,
	accent = 'brass',
}: StatCardProps) {
	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-white/20">
			<p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 truncate">
				{label}
			</p>

			<p
				className={`mt-2 font-mono text-2xl sm:text-3xl font-black tabular-nums tracking-tight wrap-break-word ${ACCENT_MAP[accent]}`}
			>
				{value}
			</p>

			{hint && (
				<p className="mt-1.5 text-xs text-neutral-400 leading-normal wrap-break-word">
					{hint}
				</p>
			)}
		</div>
	);
}
