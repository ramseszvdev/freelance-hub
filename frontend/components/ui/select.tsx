import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	error?: string;
}

export function Select({
	label,
	error,
	id,
	children,
	...selectProps
}: SelectProps) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
			>
				{label}
			</label>
			<select
				id={id}
				{...selectProps}
				className="block truncate mt-1.5 w-full rounded-md border border-ink/15 bg-paper px-3.5 py-2.5 text-ink focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
			>
				{children}
			</select>
			{error && <p className="mt-1.5 text-sm text-ledger-red">{error}</p>}
		</div>
	);
}
