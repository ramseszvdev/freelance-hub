'use client';

import Link from 'next/link';
import { useMe } from '@/lib/hooks/use-me';
import { useClients } from '@/lib/hooks/use-clients';
import { useProjects } from '@/lib/hooks/use-projects';
import { useInvoices } from '@/lib/hooks/use-invoices';
import { StatCard } from '@/components/ui/stat-card';

function formatCurrency(amount: number): string {
	return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardOverviewPage() {
	const { data: me } = useMe();
	const { data: clients, isLoading: loadingClients } = useClients();
	const { data: projects, isLoading: loadingProjects } = useProjects();
	const { data: invoices, isLoading: loadingInvoices } = useInvoices();

	const activeProjects =
		projects?.filter((p) => p.status === 'ACTIVE').length ?? 0;

	const pendingTotal =
		invoices
			?.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
			.reduce((sum, i) => sum + Number(i.total), 0) ?? 0;

	const paidThisAmount =
		invoices
			?.filter((i) => i.status === 'PAID')
			.reduce((sum, i) => sum + Number(i.total), 0) ?? 0;

	const isLoading = loadingClients || loadingProjects || loadingInvoices;

	return (
		<div className="relative min-h-screen bg-neutral-950 p-6 sm:p-10 text-neutral-100 selection:bg-brass selection:text-neutral-950 overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

			<div className="absolute -top-40 -left-40 h-125 w-125 rounded-full bg-brass/10 blur-[140px] pointer-events-none" />
			<div className="absolute top-1/2 -right-40 h-125 w-125 rounded-full bg-ledger-green/10 blur-[140px] pointer-events-none" />

			<div className="relative mx-auto max-w-7xl space-y-10">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
							Hello{me ? `, ${me.firstName}` : ''}{' '}
							<span className="inline-block animate-bounce">👋</span>
						</h1>
						<p className="mt-2 text-base text-neutral-400">
							This is what is happening in{' '}
							<span className="font-semibold text-brass">
								{me?.workspace.name ?? 'your workspace'}
							</span>
						</p>
					</div>

					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-4 py-2 text-xs font-mono backdrop-blur-md self-start md:self-auto">
						<span className="h-2 w-2 rounded-full bg-ledger-green animate-pulse" />
						<span className="text-neutral-300">Active Workspace</span>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label="Clients"
						value={isLoading ? '—' : String(clients?.length ?? 0)}
					/>
					<StatCard
						label="Active Projects"
						value={isLoading ? '—' : String(activeProjects)}
					/>
					<StatCard
						label="To collect"
						value={isLoading ? '—' : formatCurrency(pendingTotal)}
						accent="red"
					/>
					<StatCard
						label="Collected"
						value={isLoading ? '—' : formatCurrency(paidThisAmount)}
						accent="green"
					/>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div className="group relative rounded-3xl border border-white/10 bg-neutral-900/60 p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
						<div className="flex items-center justify-between border-b border-white/10 pb-4">
							<h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-brass" />
								Latest clients
							</h2>
							<Link
								href="/dashboard/clients"
								className="text-xs font-mono text-neutral-400 transition-colors hover:text-brass hover:underline"
							>
								See all →
							</Link>
						</div>

						{isLoading ? (
							<div className="mt-6 flex items-center gap-3 text-sm font-mono text-neutral-500">
								<span className="h-2 w-2 animate-ping rounded-full bg-brass" />
								Loading clients...
							</div>
						) : clients && clients.length > 0 ? (
							<ul className="mt-6 divide-y divide-white/5 space-y-1">
								{clients.slice(0, 5).map((client) => (
									<li
										key={client.id}
										className="flex items-center justify-between py-3 text-sm transition-colors hover:bg-white/2 px-2 rounded-lg"
									>
										<span className="font-semibold text-white">
											{client.name}
										</span>
										<span className="font-mono text-xs text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-white/5">
											{client.company ?? '—'}
										</span>
									</li>
								))}
							</ul>
						) : (
							<div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-center">
								<p className="text-sm text-neutral-400">
									You have no clients yet.{' '}
									<Link
										href="/dashboard/clients"
										className="font-bold text-brass transition-colors hover:underline"
									>
										Add the first one →
									</Link>
								</p>
							</div>
						)}
					</div>

					<div className="group relative rounded-3xl border border-white/10 bg-neutral-900/60 p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
						<div className="flex items-center justify-between border-b border-white/10 pb-4">
							<h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-ledger-green" />
								Recent invoices
							</h2>
							<Link
								href="/dashboard/invoices"
								className="text-xs font-mono text-neutral-400 transition-colors hover:text-brass hover:underline"
							>
								See All →
							</Link>
						</div>

						{isLoading ? (
							<div className="mt-6 flex items-center gap-3 text-sm font-mono text-neutral-500">
								<span className="h-2 w-2 animate-ping rounded-full bg-ledger-green" />
								Loading invoices...
							</div>
						) : invoices && invoices.length > 0 ? (
							<ul className="mt-6 divide-y divide-white/5 space-y-1">
								{invoices.slice(0, 5).map((invoice) => (
									<li
										key={invoice.id}
										className="flex items-center justify-between py-3 text-sm transition-colors hover:bg-white/2 px-2 rounded-lg"
									>
										<div className="flex items-center gap-3">
											<span className="font-mono font-bold text-white bg-neutral-800 px-2 py-0.5 rounded border border-white/10 text-xs">
												{invoice.number}
											</span>
											<span className="text-neutral-300 font-medium">
												{invoice.client.name}
											</span>
										</div>
										<span
											className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${
												invoice.status === 'PAID'
													? 'border-ledger-green/30 bg-ledger-green/10 text-ledger-green'
													: 'border-red-500/30 bg-red-500/10 text-red-400'
											}`}
										>
											{invoice.status}
										</span>
									</li>
								))}
							</ul>
						) : (
							<div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-center">
								<p className="text-sm text-neutral-400">
									No invoices yet.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
