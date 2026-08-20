'use client';

import { useQuery } from '@tanstack/react-query';

export interface Project {
	id: string;
	name: string;
	status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
	billingType: 'HOURLY' | 'FIXED';
	hourlyRate: string | null;
	fixedPrice: string | null;
	client: { id: string; name: string };
}

async function fetchProjects(): Promise<Project[]> {
	const res = await fetch('/api/backend/projects');
	if (!res.ok) throw new Error('Could not load the projects');
	return res.json();
}

export function useProjects() {
	return useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
}
