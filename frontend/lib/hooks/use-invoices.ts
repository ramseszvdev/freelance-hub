'use client';

import { useQuery } from '@tanstack/react-query';

export interface Invoice {
	id: string;
	number: string;
	status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
	total: string;
	dueDate: string;
	issueDate: string;
	client: { id: string; name: string };
}

async function fetchInvoices(): Promise<Invoice[]> {
	const res = await fetch('/api/backend/invoices');
	if (!res.ok) throw new Error('Could not load the invoices');
	return res.json();
}

export function useInvoices() {
	return useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });
}
