'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useProjects } from '@/lib/hooks/use-projects';
import { useInvoices } from '@/lib/hooks/use-invoices';
import {
	useGenerateInvoiceFromProject,
	useUpdateInvoiceStatus,
} from '@/lib/hooks/use-invoice-mutations';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { SkeletonRows } from '@/components/ui/skeleton-rows';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';

interface GenerateInvoiceInput {
	projectId: string;
	dueDate: string;
}

export default function InvoicesPage() {
	const { data: projects } = useProjects();
	const { data: invoices, isLoading, isError, error, refetch } = useInvoices();
	const generateInvoice = useGenerateInvoiceFromProject();
	const updateStatus = useUpdateInvoiceStatus();
	const toast = useToast();
	const [modalOpen, setModalOpen] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<GenerateInvoiceInput>();

	const onSubmit = async (data: GenerateInvoiceInput) => {
		try {
			await generateInvoice.mutateAsync({
				...data,
				dueDate: new Date(data.dueDate).toISOString(),
			});
			reset();
			setModalOpen(false);
			toast.success('Invoice generated');
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: 'Could not generate the invoice'
			);
		}
	};

	const handleMarkPaid = async (id: string, number: string) => {
		try {
			await updateStatus.mutateAsync({ id, status: 'PAID' });
			toast.success(`${number} marked as paid`);
		} catch {
			toast.error('Could not update the status');
		}
	};

	const totalPending =
		invoices
			?.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
			.reduce((sum, i) => sum + Number(i.total), 0) ?? 0;

	return (
		<div className="space-y-8">
			{/* Encabezado */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
						Invoices
					</h1>
					<p className="mt-1 text-sm text-neutral-400">
						<span className="font-mono font-bold text-brass">
							${totalPending.toFixed(2)}
						</span>{' '}
						pending collections
					</p>
				</div>
				<button
					onClick={() => setModalOpen(true)}
					disabled={!projects || projects.length === 0}
					className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-neutral-950 transition-all hover:bg-neutral-200 disabled:active:scale-100 active:scale-95 disabled:opacity-40 cursor-pointer shadow-md disabled:cursor-not-allowed"
				>
					<Plus size={16} /> Generate invoice
				</button>
			</div>

			{isError ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl">
					<ErrorState
						message={error instanceof Error ? error.message : undefined}
						onRetry={() => refetch()}
					/>
				</div>
			) : !isLoading && (!invoices || invoices.length === 0) ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-12 backdrop-blur-xl">
					<EmptyState
						icon={Receipt}
						title="There are no invoices yet"
						description="Generate your first invoice based on hours worked on your projects."
					/>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-neutral-300">
							<thead className="border-b border-white/10 bg-neutral-950/60 font-mono text-xs uppercase tracking-wider text-neutral-400">
								<tr>
									<th className="px-6 py-4">Number</th>
									<th className="px-6 py-4">Client</th>
									<th className="px-6 py-4">Expire</th>
									<th className="px-6 py-4">Total</th>
									<th className="px-6 py-4">Status</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5 font-sans">
								{isLoading ? (
									<SkeletonRows columns={6} />
								) : (
									invoices?.map((invoice) => (
										<tr
											key={invoice.id}
											className="transition-colors hover:bg-white/2 text-left"
										>
											<td className="px-6 py-4 font-mono text-xs font-bold text-white">
												{invoice.number}
											</td>
											<td
												className="max-w-50 truncate px-6 py-4 text-neutral-300 font-medium"
												title={invoice.client.name}
											>
												{invoice.client.name}
											</td>
											<td className="px-6 py-4 text-neutral-400 font-mono text-xs">
												{format(
													new Date(invoice.dueDate),
													'dd/MM/yyyy'
												)}
											</td>
											<td className="px-6 py-4 font-mono text-xs font-bold text-white">
												${Number(invoice.total).toFixed(2)}
											</td>
											<td className="px-6 py-4">
												<StatusBadge status={invoice.status} />
											</td>
											<td className="px-6 py-4 text-right">
												{invoice.status !== 'PAID' &&
												invoice.status !== 'CANCELLED' ? (
													<button
														onClick={() =>
															handleMarkPaid(
																invoice.id,
																invoice.number
															)
														}
														disabled={updateStatus.isPending}
														title="Mark as paid"
														className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-40 cursor-pointer"
													>
														<CheckCircle2 size={18} />
													</button>
												) : (
													<span className="text-neutral-600 select-none font-sans">
														—
													</span>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				title="Generar factura"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<div className="w-full min-w-0">
						<Select
							label="Proyecto"
							id="projectId"
							{...register('projectId', { required: true })}
						>
							<option
								value=""
								className="bg-neutral-900 text-neutral-400 truncate"
							>
								Select a project
							</option>
							{projects?.map((p) => {
								const labelText = `${p.name} — ${p.client.name}`;
								return (
									<option
										key={p.id}
										value={p.id}
										title={labelText}
										className="bg-neutral-900 text-white truncate"
									>
										{labelText}
									</option>
								);
							})}
						</Select>
					</div>

					<Field
						label="Expiration date"
						id="dueDate"
						type="date"
						className="scheme-dark"
						{...register('dueDate', { required: true })}
					/>

					<div className="pt-2">
						<SubmitButton loading={isSubmitting}>
							Generate invoice
						</SubmitButton>
					</div>
				</form>
			</Modal>
		</div>
	);
}
