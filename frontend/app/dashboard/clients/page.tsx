'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	Plus,
	Trash2,
	Users,
	Search,
	Mail,
	Building2,
	ExternalLink,
} from 'lucide-react';
import { useClients } from '@/lib/hooks/use-clients';
import {
	useCreateClient,
	useDeleteClient,
} from '@/lib/hooks/use-client-mutations';
import { Modal } from '@/components/ui/modal';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { SkeletonRows } from '@/components/ui/skeleton-rows';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useToast } from '@/components/ui/toast';

interface ClientFormInput {
	name: string;
	email?: string;
	company?: string;
}

export default function ClientsPage() {
	const { data: clients, isLoading, isError, error, refetch } = useClients();
	const createClient = useCreateClient();
	const deleteClient = useDeleteClient();
	const toast = useToast();
	const [modalOpen, setModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<ClientFormInput>();

	const onSubmit = async (data: ClientFormInput) => {
		try {
			await createClient.mutateAsync({
				name: data.name,
				email: data.email?.trim() || undefined,
				company: data.company?.trim() || undefined,
			});
			reset();
			setModalOpen(false);
			toast.success('Client created');
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'Could not create the client'
			);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		try {
			await deleteClient.mutateAsync(id);
			toast.success(`"${name}" deleted`);
		} catch {
			toast.error('Could not delete the client');
		}
	};

	const filteredClients = clients?.filter(
		(client) =>
			client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
						Clients
					</h1>
					<p className="mt-1 text-sm text-neutral-400">
						{clients?.length ?? 0} client
						{clients?.length === 1 ? '' : 's'} in total
					</p>
				</div>

				<button
					onClick={() => setModalOpen(true)}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-brass px-5 py-2.5 font-semibold text-neutral-000 transition-all duration-300 hover:bg-yellow-400 hover:text-neutral-950 hover:shadow-[0_0_25px_rgba(234,179,8,0.45)] cursor-pointer"
				>
					<Plus size={18} strokeWidth={2.5} /> New client
				</button>
			</div>

			{!isError && clients && clients.length > 0 && (
				<div className="relative max-w-md">
					<Search
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
						size={18}
					/>
					<input
						type="text"
						placeholder="Buscar por nombre, empresa o email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full rounded-xl border border-white/10 bg-neutral-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 backdrop-blur-md outline-none transition-all duration-200 focus:border-brass/50 focus:bg-neutral-900/90 focus:ring-1 focus:ring-brass/50"
					/>
				</div>
			)}

			{isError ? (
				<div className="mt-8 rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
					<ErrorState
						message={error instanceof Error ? error.message : undefined}
						onRetry={() => refetch()}
					/>
				</div>
			) : !isLoading && (!clients || clients.length === 0) ? (
				<div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-neutral-900/30 p-8 backdrop-blur-md">
					<EmptyState
						icon={Users}
						title="You still do not have clients yet"
						description="Add your first client to start creating projects and invoices."
						action={
							<button
								onClick={() => setModalOpen(true)}
								className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-yellow-400 hover:text-neutral-950 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] cursor-pointer"
							>
								<Plus size={16} /> Add client
							</button>
						}
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{isLoading ? (
						<SkeletonRows columns={3} />
					) : (
						filteredClients?.map((client) => (
							<div
								key={client.id}
								className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-brass/40 hover:bg-neutral-900/80 hover:shadow-[0_0_30px_rgba(234,179,8,0.12)]"
							>
								<div className="absolute inset-0 rounded-2xl border-2 border-brass/0 transition-all duration-300 group-hover:border-brass/30 pointer-events-none" />

								<div>
									<div className="flex items-start justify-between gap-3">
										<div className="space-y-1">
											<h2 className="font-display text-lg font-bold text-white transition-colors duration-200 group-hover:text-brass">
												{client.name}
											</h2>
											{client.company && (
												<p className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
													<Building2
														size={13}
														className="text-neutral-500"
													/>
													{client.company}
												</p>
											)}
										</div>
									</div>

									{client.email && (
										<div className="mt-4 flex items-center gap-2 text-xs font-mono text-neutral-400 border-t border-white/5 pt-3">
											<Mail size={14} className="text-neutral-500" />
											<span className="truncate">
												{client.email}
											</span>
										</div>
									)}
								</div>

								<div className="mt-6 flex items-center justify-end gap-2 border-t border-white/5 pt-4">
									<button
										onClick={() =>
											handleDelete(client.id, client.name)
										}
										disabled={deleteClient.isPending}
										className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800/60 px-3 py-1.5 text-xs font-semibold text-neutral-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 cursor-pointer"
										title="Delete client"
									>
										<Trash2 size={14} />
										Delete
									</button>
								</div>
							</div>
						))
					)}
				</div>
			)}

			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				title="New client"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Field
						label="Name"
						id="name"
						{...register('name', { required: true })}
					/>
					<Field
						label="Company (optional)"
						id="company"
						{...register('company')}
					/>
					<Field
						label="Email (optional)"
						id="email"
						type="email"
						{...register('email')}
					/>
					<SubmitButton loading={isSubmitting}>Create client</SubmitButton>
				</form>
			</Modal>
		</div>
	);
}
