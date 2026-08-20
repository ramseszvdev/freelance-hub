import { InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export function Field({ label, error, id, ...inputProps }: FieldProps) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
			>
				{label}
			</label>
			<input
				id={id}
				{...inputProps}
				className="mt-1.5 w-full truncate rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-2.5 font-sans text-sm text-white placeholder-neutral-500 backdrop-blur-md transition-all duration-200 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
			/>
			{error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
		</div>
	);
}
