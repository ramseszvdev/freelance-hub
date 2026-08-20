import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
	constructor(private readonly prisma: PrismaService) {}

	create(workspaceId: string, dto: CreateClientDto) {
		return this.prisma.client.create({
			data: { ...dto, workspaceId },
		});
	}

	findAll(workspaceId: string) {
		return this.prisma.client.findMany({
			where: { workspaceId },
			orderBy: { createdAt: 'desc' },
		});
	}

	/**
	 * Searches for a client by id, BUT only if they belong to the given workspace.
	 * This is what prevents a user from Workspace A from being able to read
	 * (or modify) a client from Workspace B just by guessing
	 * or trying out other people's ids in the URL.
	 */
	async findOne(workspaceId: string, id: string) {
		const client = await this.prisma.client.findFirst({
			where: { id, workspaceId },
		});

		if (!client) {
			throw new NotFoundException('Client not found');
		}

		return client;
	}

	async update(workspaceId: string, id: string, dto: UpdateClientDto) {
		// findOne already validates belonging to the workspace and throws 404 if it doesn't exist/isn't yours
		await this.findOne(workspaceId, id);

		return this.prisma.client.update({
			where: { id },
			data: dto,
		});
	}

	async remove(workspaceId: string, id: string) {
		await this.findOne(workspaceId, id);

		await this.prisma.client.delete({ where: { id } });
	}
}
