'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateClientInput {
	name: string;
	email?: string;
	company?: string;
}

export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateClientInput) => {
			const res = await fetch('/api/backend/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.message ?? 'Could not create the client');
			}
			return res.json();
		},
		onSuccess: () => {
			// Invalidates the 'clients' cache — TanStack Query fetches
			// the list again automatically, without us having to update
			// the state manually.
			queryClient.invalidateQueries({ queryKey: ['clients'] });
		},
	});
}

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/backend/clients/${id}`, {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error('No se pudo eliminar el cliente');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clients'] });
		},
	});
}
