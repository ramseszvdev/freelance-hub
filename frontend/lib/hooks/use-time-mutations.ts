'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useStartTimer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			projectId: string;
			description?: string;
		}) => {
			const res = await fetch('/api/backend/time-entries/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.message ?? 'Could not start the timer');
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['time-entries'] });
		},
	});
}

export function useStopTimer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/backend/time-entries/${id}/stop`, {
				method: 'PATCH',
			});
			if (!res.ok) throw new Error('No se pudo detener el timer');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['time-entries'] });
		},
	});
}

export function useDeleteTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/backend/time-entries/${id}`, {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error('No se pudo eliminar el registro');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['time-entries'] });
		},
	});
}
