'use client';

import { useMutation } from '@tanstack/react-query';

interface CheckoutResponse {
	checkoutUrl: string;
}

export function useCreateCheckoutSession() {
	return useMutation({
		mutationFn: async (plan: 'PRO' | 'BUSINESS') => {
			const res = await fetch('/api/backend/billing/checkout-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ plan }),
			});
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.message ?? 'Could not start the payment');
			}
			return res.json() as Promise<CheckoutResponse>;
		},
	});
}
