import {
	ConflictException,
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { CreateManualEntryDto } from './dto/create-manual-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

@Injectable()
export class TimeEntriesService {
	constructor(private readonly prisma: PrismaService) {}

	async startTimer(workspaceId: string, dto: StartTimerDto) {
		await this.assertProjectBelongsToWorkspace(workspaceId, dto.projectId);

		// Business rule: only one timer running at a time per workspace.
		const runningEntry = await this.prisma.timeEntry.findFirst({
			where: { project: { workspaceId }, endedAt: null },
			include: { project: { select: { name: true } } },
		});

		if (runningEntry) {
			throw new ConflictException(
				`There is already a timer running on "${runningEntry.project.name}". Stop it before starting a new one.`
			);
		}

		return this.prisma.timeEntry.create({
			data: {
				projectId: dto.projectId,
				description: dto.description,
				startedAt: new Date(),
			},
		});
	}

	async stopTimer(workspaceId: string, id: string) {
		const entry = await this.findRawOrThrow(workspaceId, id);

		if (entry.endedAt) {
			throw new ConflictException('This timer has already been stopped');
		}

		const endedAt = new Date();
		const durationMin = this.diffInMinutes(entry.startedAt, endedAt);

		return this.prisma.timeEntry.update({
			where: { id },
			data: { endedAt, durationMin },
		});
	}

	async createManual(workspaceId: string, dto: CreateManualEntryDto) {
		await this.assertProjectBelongsToWorkspace(workspaceId, dto.projectId);

		const startedAt = new Date(dto.startedAt);
		const endedAt = new Date(dto.endedAt);

		if (endedAt <= startedAt) {
			throw new BadRequestException('endedAt must be after startedAt');
		}

		return this.prisma.timeEntry.create({
			data: {
				projectId: dto.projectId,
				description: dto.description,
				startedAt,
				endedAt,
				durationMin: this.diffInMinutes(startedAt, endedAt),
			},
		});
	}

	findAll(workspaceId: string, projectId?: string) {
		return this.prisma.timeEntry.findMany({
			where: {
				project: { workspaceId },
				...(projectId && { projectId }),
			},
			include: { project: { select: { id: true, name: true } } },
			orderBy: { startedAt: 'desc' },
		});
	}

	async findOne(workspaceId: string, id: string) {
		return this.findRawOrThrow(workspaceId, id, true);
	}

	async update(workspaceId: string, id: string, dto: UpdateTimeEntryDto) {
		const entry = await this.findRawOrThrow(workspaceId, id);

		const startedAt = dto.startedAt
			? new Date(dto.startedAt)
			: entry.startedAt;
		const endedAt = dto.endedAt ? new Date(dto.endedAt) : entry.endedAt;

		if (endedAt && endedAt <= startedAt) {
			throw new BadRequestException('endedAt must be after startedAt');
		}

		return this.prisma.timeEntry.update({
			where: { id },
			data: {
				description: dto.description ?? entry.description,
				startedAt,
				endedAt,
				durationMin: endedAt
					? this.diffInMinutes(startedAt, endedAt)
					: null,
			},
		});
	}

	async remove(workspaceId: string, id: string) {
		await this.findRawOrThrow(workspaceId, id);
		await this.prisma.timeEntry.delete({ where: { id } });
	}

	private async assertProjectBelongsToWorkspace(
		workspaceId: string,
		projectId: string
	) {
		const project = await this.prisma.project.findFirst({
			where: { id: projectId, workspaceId },
		});

		if (!project) {
			throw new NotFoundException(
				'Specified project does not exist in this workspace'
			);
		}
	}

	private async findRawOrThrow(
		workspaceId: string,
		id: string,
		withProject = false
	) {
		const entry = await this.prisma.timeEntry.findFirst({
			where: { id, project: { workspaceId } },
			include: withProject
				? { project: { select: { id: true, name: true } } }
				: undefined,
		});

		if (!entry) {
			throw new NotFoundException('Time record not found');
		}

		return entry;
	}

	private diffInMinutes(start: Date, end: Date): number {
		return Math.round((end.getTime() - start.getTime()) / 60000);
	}
}
