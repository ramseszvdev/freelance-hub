'use client';

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useResendVerification } from '@/lib/hooks/use-resend-verification';
import { useToast } from '@/components/ui/toast';

const COOLDOWN_SECONDS = 30;

export function VerifyEmailBanner() {
	const resend = useResendVerification();
	const toast = useToast();
	const [cooldown, setCooldown] = useState(0);

	const handleResend = async () => {
		try {
			await resend.mutateAsync();
			toast.success('Verification email resent — check your inbox');

			setCooldown(COOLDOWN_SECONDS);
			const interval = setInterval(() => {
				setCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} catch {
			toast.error('Email could not be resent');
		}
	};

	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brass/30 bg-neutral-900/80 px-4 sm:px-6 py-3 backdrop-blur-md">
			<div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200 min-w-0">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brass/30 bg-brass/10 text-brass">
					<Mail size={15} />
				</div>
				<span className="truncate">
					Confirm your email to activate all the features of your account.
				</span>
			</div>

			<button
				onClick={handleResend}
				disabled={resend.isPending || cooldown > 0}
				className="flex shrink-0 items-center justify-center gap-1.5 self-start sm:self-auto rounded-lg border border-brass/30 bg-brass/10 px-3 py-1 font-sans text-xs font-bold text-brass transition-all duration-200 hover:border-brass hover:bg-brass hover:bg-amber-50 hover:text-neutral-950 active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
			>
				{resend.isPending && (
					<Loader2
						size={12}
						className="animate-spin text-current shrink-0"
					/>
				)}
				<span>
					{cooldown > 0
						? `Resend in ${cooldown}s`
						: resend.isPending
							? 'Sending...'
							: 'Resend email'}
				</span>
			</button>
		</div>
	);
}
