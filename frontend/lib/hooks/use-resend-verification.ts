'use client';

import { useMutation } from '@tanstack/react-query';

export function useResendVerification() {
	return useMutation({
		mutationFn: async () => {
			const res = await fetch('/api/backend/auth/resend-verification', {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Could not resend the email');
			return res.json();
		},
	});
}
