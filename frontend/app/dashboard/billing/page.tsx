'use client';

import { useMe } from '@/lib/hooks/use-me';
import { useCreateCheckoutSession } from '@/lib/hooks/use-billing-mutations';
import { PlanCard } from '@/components/dashboard/plan-card';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, Zap } from 'lucide-react';

export default function BillingPage() {
	const { data: me } = useMe();
	const checkout = useCreateCheckoutSession();
	const toast = useToast();

	const handleUpgrade = async (plan: 'PRO' | 'BUSINESS') => {
		try {
			const { checkoutUrl } = await checkout.mutateAsync(plan);
			window.location.href = checkoutUrl;
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'Could not start the payment'
			);
		}
	};

	const currentPlan = me?.subscription?.plan ?? 'FREE';
	const subscriptionStatus = me?.subscription?.status ?? 'ACTIVE';

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
						Plan & payments
					</h1>
					<p className="mt-1 text-sm text-neutral-400">
						Manage your subscription and choose the plan that best fits
						your work
					</p>
				</div>

				<div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-2 backdrop-blur-md">
					<div className="flex items-center gap-1.5">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
						</span>
						<span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
							Status:
						</span>
					</div>
					<span className="font-mono text-xs font-bold uppercase text-white">
						{subscriptionStatus}
					</span>
				</div>
			</div>

			{/* Grid de Planes */}
			<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				<PlanCard
					name="FREE"
					price="$0"
					features={['3 clientes', '2 proyectos', 'Facturación básica']}
					current={currentPlan === 'FREE'}
				/>
				<PlanCard
					name="PRO"
					price="$15/month"
					features={[
						'Unlimited Clients',
						'Unlimited Projects',
						'Automatic billing',
						'Priority support',
					]}
					current={currentPlan === 'PRO'}
					onUpgrade={() => handleUpgrade('PRO')}
					loading={checkout.isPending}
				/>
				<PlanCard
					name="BUSINESS"
					price="$35/month"
					features={[
						'Everything PRO',
						'Multiple team members',
						'Advanced reports',
						'Dedicated support',
					]}
					current={currentPlan === 'BUSINESS'}
					onUpgrade={() => handleUpgrade('BUSINESS')}
					loading={checkout.isPending}
				/>
			</div>

			{/* Pie Informativo de Garantía/Seguridad */}
			<div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/5 bg-neutral-950/40 p-6 text-center sm:flex-row sm:text-left backdrop-blur-md">
				<div className="flex items-center gap-3 text-neutral-400 text-sm">
					<ShieldCheck size={20} className="text-brass shrink-0" />
					<span>
						Payments processed 100% securely. Cancel or change your plan
						anytime.
					</span>
				</div>
				<div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
					<Zap size={14} className="text-amber-400" />
					<span>Flexible subscription</span>
				</div>
			</div>
		</div>
	);
}
