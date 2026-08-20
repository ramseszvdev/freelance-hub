'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Toast {
	id: number;
	type: 'success' | 'error';
	message: string;
}

interface ToastContextValue {
	success: (message: string) => void;
	error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const push = useCallback((type: Toast['type'], message: string) => {
		const id = nextId++;
		setToasts((prev) => [...prev, { id, type, message }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	}, []);

	const value: ToastContextValue = {
		success: (message) => push('success', message),
		error: (message) => push('error', message),
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 text-xs sm:text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
							toast.type === 'success'
								? 'border-emerald-500/30 bg-neutral-900/90 shadow-emerald-500/5'
								: 'border-red-500/30 bg-neutral-900/90 shadow-red-500/5'
						}`}
					>
						<div className="flex items-center gap-3 min-w-0">
							{toast.type === 'success' ? (
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
									<CheckCircle2 size={16} />
								</div>
							) : (
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
									<XCircle size={16} />
								</div>
							)}
							<span className="leading-snug text-neutral-200 wrap-break-word">
								{toast.message}
							</span>
						</div>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
	return ctx;
}
