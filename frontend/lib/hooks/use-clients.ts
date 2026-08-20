'use client';

import { useQuery } from '@tanstack/react-query';

export interface Client {
	id: string;
	name: string;
	email: string | null;
	company: string | null;
	createdAt: string;
}

async function fetchClients(): Promise<Client[]> {
	const res = await fetch('/api/backend/clients');
	if (!res.ok) throw new Error('Could not load the clients');
	return res.json();
}

export function useClients() {
	return useQuery({ queryKey: ['clients'], queryFn: fetchClients });
}
