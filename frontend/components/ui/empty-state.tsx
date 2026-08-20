import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-14 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brass/20 bg-brass/10 text-brass shadow-inner">
				<Icon size={22} />
			</div>

			<p className="mt-4 font-display text-base font-bold text-white">
				{title}
			</p>
			{description && (
				<p className="mt-1.5 max-w-sm text-sm text-neutral-400 leading-relaxed">
					{description}
				</p>
			)}

			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
