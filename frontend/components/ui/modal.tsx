'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) =>
			e.key === 'Escape' && onClose();

		if (open) {
			document.body.style.overflow = 'hidden';
			document.addEventListener('keydown', handleEscape);
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
				onClick={onClose}
			/>

			<div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-neutral-100 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<h2 className="font-display text-xl font-bold tracking-tight text-white">
						{title}
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				<div className="mt-5">{children}</div>
			</div>
		</div>
	);
}
