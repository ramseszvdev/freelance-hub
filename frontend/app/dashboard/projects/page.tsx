'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Plus, Trash2, FolderKanban, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useClients } from '@/lib/hooks/use-clients';
import { useProjects } from '@/lib/hooks/use-projects';
import {
	useCreateProject,
	useDeleteProject,
} from '@/lib/hooks/use-project-mutations';
import { Modal } from '@/components/ui/modal';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { SkeletonRows } from '@/components/ui/skeleton-rows';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useToast } from '@/components/ui/toast';

interface ProjectFormInput {
	clientId: string;
	name: string;
	billingType: 'HOURLY' | 'FIXED';
	hourlyRate?: number;
	fixedPrice?: number;
}

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
	ACTIVE: {
		label: 'Active',
		style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
	},
	PAUSED: {
		label: 'Paused',
		style: 'border-brass/30 bg-brass/10 text-brass shadow-[0_0_12px_rgba(234,179,8,0.2)]',
	},
	COMPLETED: {
		label: 'Completed',
		style: 'border-white/10 bg-white/5 text-neutral-400',
	},
	ARCHIVED: {
		label: 'Archived',
		style: 'border-white/10 bg-white/5 text-neutral-500 line-through',
	},
};

export default function ProjectsPage() {
	const { data: clients } = useClients();
	const { data: projects, isLoading, isError, error, refetch } = useProjects();
	const createProject = useCreateProject();
	const deleteProject = useDeleteProject();
	const toast = useToast();
	const [modalOpen, setModalOpen] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { isSubmitting },
	} = useForm<ProjectFormInput>({ defaultValues: { billingType: 'HOURLY' } });

	const billingType = useWatch({ control, name: 'billingType' });

	const onSubmit = async (data: ProjectFormInput) => {
		try {
			await createProject.mutateAsync({
				...data,
				hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
				fixedPrice: data.fixedPrice ? Number(data.fixedPrice) : undefined,
			});
			reset();
			setModalOpen(false);
			toast.success('Project created successfully');
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'Could not create the project'
			);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		try {
			await deleteProject.mutateAsync(id);
			toast.success(`"${name}" deleted`);
		} catch {
			toast.error('Could not delete the project');
		}
	};

	const noClients = clients && clients.length === 0;

	return (
		<div className="space-y-8">
			{/* Encabezado */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
						Projects
					</h1>
					<p className="mt-1 text-sm text-neutral-400">
						{projects?.length ?? 0} project
						{projects?.length === 1 ? '' : 's'} in progress
					</p>
				</div>
				<button
					onClick={() => setModalOpen(true)}
					disabled={noClients}
					className="flex items-center justify-center gap-2 rounded-xl bg-brass px-5 py-2.5 font-sans text-sm font-bold text-white transition-all hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
				>
					<Plus size={18} strokeWidth={2.5} /> New project
				</button>
			</div>

			{noClients && (
				<div className="flex items-center justify-between rounded-xl border border-brass/20 bg-brass/10 p-4 text-sm text-brass backdrop-blur-md">
					<span>
						You need to register at least one client before creating a
						project.
					</span>
					<Link
						href="/dashboard/clients"
						className="flex items-center gap-1.5 font-bold hover:underline"
					>
						Create client <ArrowRight size={16} />
					</Link>
				</div>
			)}

			{isError ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl">
					<ErrorState
						message={error instanceof Error ? error.message : undefined}
						onRetry={() => refetch()}
					/>
				</div>
			) : !isLoading && (!projects || projects.length === 0) ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-12 backdrop-blur-xl">
					<EmptyState
						icon={FolderKanban}
						title="You have no projects yet"
						description="Create a project to start tracking hours and generating invoices."
					/>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-neutral-300">
							<thead className="border-b border-white/10 bg-neutral-950/60 font-mono text-xs uppercase tracking-wider text-neutral-400">
								<tr>
									<th className="px-6 py-4">Project</th>
									<th className="px-6 py-4">Client</th>
									<th className="px-6 py-4">Billing</th>
									<th className="px-6 py-4">Status</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5 font-sans">
								{isLoading ? (
									<SkeletonRows columns={5} />
								) : (
									projects?.map((project) => {
										const badge = STATUS_BADGES[project.status] || {
											label: project.status,
											style: 'border-white/10 bg-white/5 text-neutral-400',
										};

										return (
											<tr
												key={project.id}
												className="transition-colors hover:bg-white/2"
											>
												<td className="px-6 py-4 font-bold text-white">
													{project.name}
												</td>
												<td className="px-6 py-4 text-neutral-400">
													{project.client.name}
												</td>
												<td className="px-6 py-4 font-mono text-xs font-semibold text-brass">
													{project.billingType === 'HOURLY'
														? `$${project.hourlyRate}/h`
														: `$${project.fixedPrice} fixed`}
												</td>
												<td className="px-6 py-4">
													<span
														className={`inline-flex items-center rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide ${badge.style}`}
													>
														{badge.label}
													</span>
												</td>
												<td className="px-6 py-4 text-right">
													<button
														onClick={() =>
															handleDelete(
																project.id,
																project.name
															)
														}
														disabled={deleteProject.isPending}
														className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 cursor-pointer"
														title="Delete project"
													>
														<Trash2 size={18} />
													</button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Modal para Crear Proyecto */}
			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				title="New project"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Select
						label="Client"
						id="clientId"
						{...register('clientId', { required: true })}
					>
						<option value="" className="bg-neutral-900 text-neutral-400">
							Select a client
						</option>
						{clients?.map((client) => (
							<option
								key={client.id}
								value={client.id}
								className="bg-neutral-900 text-white"
							>
								{client.name}
							</option>
						))}
					</Select>

					<Field
						label="Project name"
						id="name"
						placeholder="e.g., Mobile App Redesign"
						{...register('name', { required: true })}
					/>

					<Select
						label="Billing type"
						id="billingType"
						{...register('billingType')}
					>
						<option value="HOURLY" className="bg-neutral-900 text-white">
							Per hour
						</option>
						<option value="FIXED" className="bg-neutral-900 text-white">
							Fixed price
						</option>
					</Select>

					{billingType === 'HOURLY' ? (
						<Field
							label="Hourly rate ($)"
							id="hourlyRate"
							type="number"
							step="0.01"
							placeholder="50.00"
							{...register('hourlyRate', { required: true })}
						/>
					) : (
						<Field
							label="Fixed price ($)"
							id="fixedPrice"
							type="number"
							step="0.01"
							placeholder="1500.00"
							{...register('fixedPrice', { required: true })}
						/>
					)}

					<div className="pt-2">
						<SubmitButton loading={isSubmitting}>
							Create project
						</SubmitButton>
					</div>
				</form>
			</Modal>
		</div>
	);
}
