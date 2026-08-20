import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(workspaceId: string, dto: CreateProjectDto) {
		// Verify that the client exists AND belongs to this workspace,
		// preventing someone from linking a project to someone else's client
		// by guessing/trying a clientId from another workspace.
		await this.assertClientBelongsToWorkspace(workspaceId, dto.clientId);

		return this.prisma.project.create({
			data: { ...dto, workspaceId },
		});
	}

	findAll(workspaceId: string) {
		return this.prisma.project.findMany({
			where: { workspaceId },
			include: { client: { select: { id: true, name: true } } },
			orderBy: { createdAt: 'desc' },
		});
	}

	async findOne(workspaceId: string, id: string) {
		const project = await this.prisma.project.findFirst({
			where: { id, workspaceId },
			include: { client: { select: { id: true, name: true } } },
		});

		if (!project) {
			throw new NotFoundException('Project not found');
		}

		return project;
	}

	async update(workspaceId: string, id: string, dto: UpdateProjectDto) {
		await this.findOne(workspaceId, id);

		if (dto.clientId) {
			await this.assertClientBelongsToWorkspace(workspaceId, dto.clientId);
		}

		return this.prisma.project.update({
			where: { id },
			data: dto,
		});
	}

	async remove(workspaceId: string, id: string) {
		await this.findOne(workspaceId, id);
		await this.prisma.project.delete({ where: { id } });
	}

	private async assertClientBelongsToWorkspace(
		workspaceId: string,
		clientId: string
	) {
		const client = await this.prisma.client.findFirst({
			where: { id: clientId, workspaceId },
		});

		if (!client) {
			throw new NotFoundException(
				'Specified client does not exist in this workspace'
			);
		}
	}
}
