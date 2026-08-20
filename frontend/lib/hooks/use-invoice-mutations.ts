'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useGenerateInvoiceFromProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { projectId: string; dueDate: string }) => {
			const res = await fetch(
				'/api/backend/invoices/generate-from-project',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(input),
				}
			);
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.message ?? 'Could not generate the invoice');
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			// We also invalidate time-entries: the hours used now
			// are marked as 'billed', and that table must reflect it.
			queryClient.invalidateQueries({ queryKey: ['time-entries'] });
		},
	});
}

export function useUpdateInvoiceStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const res = await fetch(`/api/backend/invoices/${id}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) throw new Error('No se pudo actualizar el estado');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
		},
	});
}
