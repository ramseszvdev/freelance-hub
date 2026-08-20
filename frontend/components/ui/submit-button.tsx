interface SubmitButtonProps {
	loading?: boolean;
	children: React.ReactNode;
}

export function SubmitButton({ loading, children }: SubmitButtonProps) {
	return (
		<button
			type="submit"
			disabled={loading}
			className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 font-sans text-sm font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
		>
			{loading ? 'Loading...' : children}
		</button>
	);
}
