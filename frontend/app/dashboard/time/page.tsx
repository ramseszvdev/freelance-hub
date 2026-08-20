'use client';

import { useForm } from 'react-hook-form';
import { Play, Trash2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTimeEntries } from '@/lib/hooks/use-time-entries';
import {
	useStartTimer,
	useStopTimer,
	useDeleteTimeEntry,
} from '@/lib/hooks/use-time-mutations';
import { ActiveTimer } from '@/components/dashboard/active-timer';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { SkeletonRows } from '@/components/ui/skeleton-rows';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useToast } from '@/components/ui/toast';

interface StartTimerInput {
	projectId: string;
	description?: string;
}

function formatDuration(minutes: number | null): string {
	if (minutes === null) return '—';
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TimePage() {
	const { data: projects } = useProjects();
	const {
		data: entries,
		isLoading,
		isError,
		error,
		refetch,
	} = useTimeEntries();
	const startTimer = useStartTimer();
	const stopTimer = useStopTimer();
	const deleteEntry = useDeleteTimeEntry();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<StartTimerInput>();

	const runningEntry = entries?.find((e) => e.endedAt === null);
	const runningProject = projects?.find(
		(p) => p.id === runningEntry?.project.id
	);

	const onSubmit = async (data: StartTimerInput) => {
		try {
			await startTimer.mutateAsync(data);
			reset();
			toast.success('Timer started');
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'Could not start the timer'
			);
		}
	};

	const handleStop = async (id: string) => {
		try {
			await stopTimer.mutateAsync(id);
			toast.success('Timer stopped');
		} catch {
			toast.error('Could not stop the timer');
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteEntry.mutateAsync(id);
			toast.success('Record deleted');
		} catch {
			toast.error('Could not delete the record');
		}
	};

	const pastEntries = entries?.filter((e) => e.endedAt !== null) ?? [];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
					Hours
				</h1>
				<p className="mt-1 text-sm text-neutral-400">
					Track and manage the time worked on your projects
				</p>
			</div>

			<div>
				{runningEntry ? (
					<ActiveTimer
						projectName={runningEntry.project.name}
						description={runningEntry.description}
						startedAt={runningEntry.startedAt}
						hourlyRate={
							runningProject?.billingType === 'HOURLY' &&
							runningProject.hourlyRate
								? Number(runningProject.hourlyRate)
								: null
						}
						onStop={() => handleStop(runningEntry.id)}
						stopping={stopTimer.isPending}
					/>
				) : (
					<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-xl shadow-2xl sm:p-8">
						<h2 className="font-display text-lg font-bold text-white">
							Start a timer
						</h2>

						{projects && projects.length === 0 ? (
							<div className="mt-4 flex items-center justify-between rounded-xl border border-brass/20 bg-brass/10 p-4 text-sm text-brass backdrop-blur-md">
								<span>
									You need at least one active project to start a
									timer.
								</span>
								<Link
									href="/dashboard/projects"
									className="flex items-center gap-1.5 font-bold hover:underline"
								>
									Create project <ArrowRight size={16} />
								</Link>
							</div>
						) : (
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="mt-5 flex flex-col gap-4 md:flex-row md:items-end"
							>
								<div className="flex-1">
									<Select
										label="Project"
										id="projectId"
										{...register('projectId', { required: true })}
									>
										<option
											value=""
											className="bg-neutral-900 text-neutral-400"
										>
											Select a project
										</option>
										{projects?.map((p) => (
											<option
												key={p.id}
												value={p.id}
												className="bg-neutral-900 text-white"
											>
												{p.name} — {p.client.name}
											</option>
										))}
									</Select>
								</div>

								<div className="flex-1">
									<Field
										label="Description (optional)"
										id="description"
										placeholder="e.g., Dashboard layout..."
										{...register('description')}
									/>
								</div>

								<div className="md:w-auto">
									<SubmitButton loading={isSubmitting}>
										<span className="flex items-center justify-center gap-2">
											<Play size={16} fill="currentColor" /> Start
										</span>
									</SubmitButton>
								</div>
							</form>
						)}
					</div>
				)}
			</div>

			{isError ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl">
					<ErrorState
						message={error instanceof Error ? error.message : undefined}
						onRetry={() => refetch()}
					/>
				</div>
			) : !isLoading && pastEntries.length === 0 ? (
				<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-12 backdrop-blur-xl">
					<EmptyState
						icon={Clock}
						title="There are no hours recorded yet"
						description="Start a timer up top to begin tracking the time for your tasks."
					/>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-neutral-300">
							<thead className="border-b border-white/10 bg-neutral-950/60 font-mono text-xs uppercase tracking-wider text-neutral-400">
								<tr>
									<th className="px-6 py-4">Project</th>
									<th className="px-6 py-4">Description</th>
									<th className="px-6 py-4">Duration</th>
									<th className="px-6 py-4">Billed</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5 font-sans">
								{isLoading ? (
									<SkeletonRows columns={5} />
								) : (
									pastEntries.map((entry) => (
										<tr
											key={entry.id}
											className="transition-colors hover:bg-white/2"
										>
											<td className="px-6 py-4 font-bold text-white">
												{entry.project.name}
											</td>
											<td className="px-6 py-4 text-neutral-400">
												{entry.description || '—'}
											</td>
											<td className="px-6 py-4 font-mono text-xs font-semibold text-brass">
												{formatDuration(entry.durationMin)}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide ${
														entry.billed
															? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
															: 'border-white/10 bg-white/5 text-neutral-400'
													}`}
												>
													{entry.billed ? 'Yes' : 'No'}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												{!entry.billed ? (
													<button
														onClick={() => handleDelete(entry.id)}
														disabled={deleteEntry.isPending}
														className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 cursor-pointer"
														title="Delete record"
													>
														<Trash2 size={18} />
													</button>
												) : (
													<span className="text-neutral-600 select-none font-sans pl-1">
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
		</div>
	);
}
