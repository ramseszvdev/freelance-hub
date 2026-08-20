import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
	message?: string;
	onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-14 text-center">
			{/* Icono de Alerta con contenedor neón rojo */}
			<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
				<AlertTriangle size={22} />
			</div>

			{/* Mensajes de error */}
			<p className="mt-4 font-display text-base font-bold text-white">
				Could not load the information
			</p>
			<p className="mt-1.5 max-w-sm text-sm text-neutral-400 leading-relaxed wrap-break-word">
				{message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'}
			</p>

			{onRetry && (
				<button
					onClick={onRetry}
					className="group mt-6 flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-2 font-sans text-xs font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-neutral-950 active:scale-95"
				>
					<RotateCw
						size={14}
						className="transition-transform group-hover:rotate-180 duration-500"
					/>
					<span>Retry</span>
				</button>
			)}
		</div>
	);
}
