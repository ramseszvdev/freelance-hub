const STATUS_STYLES: Record<string, string> = {
	DRAFT: 'border-white/10 bg-white/5 text-neutral-400',
	SENT: 'border-brass/30 bg-brass/10 text-brass',
	PAID: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
	OVERDUE:
		'border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
	CANCELLED: 'border-white/10 bg-white/5 text-neutral-500 line-through',
};

export function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
				STATUS_STYLES[status] ??
				'border-white/10 bg-white/5 text-neutral-400'
			}`}
		>
			{status}
		</span>
	);
}
