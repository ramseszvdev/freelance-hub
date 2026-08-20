'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateProjectInput {
	clientId: string;
	name: string;
	billingType: 'HOURLY' | 'FIXED';
	hourlyRate?: number;
	fixedPrice?: number;
}

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateProjectInput) => {
			const res = await fetch('/api/backend/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.message ?? 'Could not load the project');
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/backend/projects/${id}`, {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error('No se pudo eliminar el proyecto');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		},
	});
}
