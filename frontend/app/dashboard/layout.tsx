'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
	LayoutDashboard,
	Users,
	FolderKanban,
	Receipt,
	Clock,
	CreditCard,
	LogOut,
} from 'lucide-react';
import { useMe } from '@/lib/hooks/use-me';
import { VerifyEmailBanner } from '@/components/dashboard/verify-email-banner';

const NAV_ITEMS = [
	{ href: '/dashboard', label: 'Summary', icon: LayoutDashboard },
	{ href: '/dashboard/clients', label: 'Clients', icon: Users },
	{ href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
	{ href: '/dashboard/time', label: 'Hours', icon: Clock },
	{ href: '/dashboard/invoices', label: 'Invoices', icon: Receipt },
	{ href: '/dashboard/billing', label: 'Plan and payments', icon: CreditCard },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: me } = useMe();

	const handleLogout = async () => {
		await fetch('/api/auth/logout', { method: 'POST' });
		router.push('/login');
		router.refresh();
	};

	return (
		<div className="relative flex min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-brass selection:text-neutral-950">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

			<div className="absolute -top-40 -left-40 h-125 w-125 rounded-full bg-brass/10 blur-[140px] pointer-events-none" />
			<div className="absolute top-1/2 -right-40 h-125 w-125 rounded-full bg-ledger-green/10 blur-[140px] pointer-events-none" />

			<aside className="relative flex w-64 flex-col border-r border-white/10 bg-neutral-900/80 px-4 py-6 backdrop-blur-2xl">
				<Link
					href="/"
					className="group flex items-center gap-2 px-2 font-display text-xl font-black tracking-tight text-white transition-opacity hover:opacity-90"
				>
					<span className="inline-block h-3 w-3 bg-brass transition-transform duration-300 group-hover:rotate-45 group-hover:scale-125" />
					Freelance Hub
				</Link>

				<nav className="mt-8 flex flex-1 flex-col gap-1.5">
					{NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
									isActive
										? 'bg-brass text-neutral-300 shadow-[0_0_25px_rgba(100,255,255,0.35)]'
										: 'text-neutral-400 hover:bg-white/5 hover:text-white'
								}`}
							>
								<Icon
									size={18}
									strokeWidth={isActive ? 2.5 : 2}
									className={
										isActive ? 'text-neutral-300' : 'text-neutral-400'
									}
								/>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="border-t border-white/10 pt-4">
					{me && (
						<div className="rounded-xl border border-white/5 bg-neutral-950/60 p-3 backdrop-blur-md">
							<p className="truncate text-sm font-bold text-white">
								{me.firstName} {me.lastName}
							</p>
							<div className="mt-1 flex items-center gap-2">
								<span className="inline-flex items-center rounded-md border border-brass/30 bg-brass/10 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-brass">
									{me.subscription.plan}
								</span>
							</div>
						</div>
					)}
					<button
						onClick={handleLogout}
						className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 cursor-pointer"
					>
						<LogOut size={18} strokeWidth={2} />
						Log out
					</button>
				</div>
			</aside>

			<div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
				{me && !me.emailVerifiedAt && <VerifyEmailBanner />}
				<main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
			</div>
		</div>
	);
}
