'use client';

import { useQuery } from '@tanstack/react-query';

export interface TimeEntry {
	id: string;
	description: string | null;
	startedAt: string;
	endedAt: string | null;
	durationMin: number | null;
	billed: boolean;
	project: { id: string; name: string };
}

async function fetchTimeEntries(): Promise<TimeEntry[]> {
	const res = await fetch('/api/backend/time-entries');
	if (!res.ok) throw new Error('Could not load the time logs');
	return res.json();
}

export function useTimeEntries() {
	return useQuery({
		queryKey: ['time-entries'],
		queryFn: fetchTimeEntries,
		// Refreshes by itself every 10s — that way if there's a timer running, the UI
		// (and the visual clock) stay consistent without any manual action.
		refetchInterval: 10_000,
	});
}
