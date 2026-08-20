'use client';

import { useQuery } from '@tanstack/react-query';

interface MeResponse {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	emailVerifiedAt: string | null;
	workspace: { id: string; name: string; slug: string };
	role: string;
	subscription: {
		plan: string;
		status: string;
		currentPeriodEnd: string | null;
	};
}

async function fetchMe(): Promise<MeResponse> {
	const res = await fetch('/api/backend/users/me');
	if (!res.ok) throw new Error('Could not load the profile');
	return res.json();
}

export function useMe() {
	return useQuery({ queryKey: ['me'], queryFn: fetchMe });
}
