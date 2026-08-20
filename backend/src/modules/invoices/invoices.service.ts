import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateFromProjectDto } from './dto/generate-from-project.dto';
import { CreateManualInvoiceDto } from './dto/create-manual-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@Injectable()
export class InvoicesService {
	constructor(private readonly prisma: PrismaService) {}

	async generateFromProject(workspaceId: string, dto: GenerateFromProjectDto) {
		const project = await this.prisma.project.findFirst({
			where: { id: dto.projectId, workspaceId },
		});

		if (!project) {
			throw new NotFoundException('Project not found in this workspace');
		}

		const unbilledEntries = await this.prisma.timeEntry.findMany({
			where: {
				projectId: project.id,
				billed: false,
				endedAt: { not: null },
			},
		});

		if (unbilledEntries.length === 0) {
			throw new BadRequestException(
				'There are no unbilled hours for this project'
			);
		}

		return this.prisma.$transaction(async (tx) => {
			let items: {
				description: string;
				quantity: number;
				unitPrice: number;
				amount: number;
				projectId: string;
			}[];

			if (project.billingType === 'HOURLY') {
				const rate = Number(project.hourlyRate ?? 0);
				const totalMinutes = unbilledEntries.reduce(
					(sum, e) => sum + (e.durationMin ?? 0),
					0
				);
				const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

				items = [
					{
						description: `Hours worked — ${project.name}`,
						quantity: totalHours,
						unitPrice: rate,
						amount: Math.round(totalHours * rate * 100) / 100,
						projectId: project.id,
					},
				];
			} else {
				// FIXED: a single item with the agreed price.
				const price = Number(project.fixedPrice ?? 0);
				items = [
					{
						description: project.name,
						quantity: 1,
						unitPrice: price,
						amount: price,
						projectId: project.id,
					},
				];
			}

			const invoice = await this.createInvoiceWithItems(tx, {
				workspaceId,
				clientId: project.clientId,
				dueDate: new Date(dto.dueDate),
				items,
			});

			// Mark the hours used as billed so they don't get duplicated
			// on the next invoice for this project.
			await tx.timeEntry.updateMany({
				where: { id: { in: unbilledEntries.map((e) => e.id) } },
				data: { billed: true },
			});

			return invoice;
		});
	}

	async createManual(workspaceId: string, dto: CreateManualInvoiceDto) {
		const client = await this.prisma.client.findFirst({
			where: { id: dto.clientId, workspaceId },
		});

		if (!client) {
			throw new NotFoundException('Client not found in this workspace');
		}

		const items = dto.items.map((item) => ({
			description: item.description,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
			projectId: item.projectId,
		}));

		return this.prisma.$transaction((tx) =>
			this.createInvoiceWithItems(tx, {
				workspaceId,
				clientId: dto.clientId,
				dueDate: new Date(dto.dueDate),
				items,
			})
		);
	}

	findAll(workspaceId: string, status?: string) {
		return this.prisma.invoice.findMany({
			where: { workspaceId, ...(status && { status: status as any }) },
			include: {
				client: { select: { id: true, name: true } },
				items: true,
			},
			orderBy: { issueDate: 'desc' },
		});
	}

	async findOne(workspaceId: string, id: string) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id, workspaceId },
			include: {
				client: true,
				items: {
					include: { project: { select: { id: true, name: true } } },
				},
			},
		});

		if (!invoice) {
			throw new NotFoundException('Invoice not found');
		}

		return invoice;
	}

	async updateStatus(
		workspaceId: string,
		id: string,
		dto: UpdateInvoiceStatusDto
	) {
		await this.findOne(workspaceId, id);

		return this.prisma.invoice.update({
			where: { id },
			data: {
				status: dto.status,
				// If it's marked as paid, we record the exact moment.
				...(dto.status === 'PAID' && { paidAt: new Date() }),
			},
		});
	}

	async remove(workspaceId: string, id: string) {
		const invoice = await this.findOne(workspaceId, id);

		if (invoice.status !== 'DRAFT') {
			throw new BadRequestException(
				'Invoices can only be deleted when they are in DRAFT status'
			);
		}

		await this.prisma.invoice.delete({ where: { id } });
	}

	/**
	 * Shared helper: creates the invoice + its items + calculates totals,
	 * generating the sequential number (INV-0001, INV-0002...) INSIDE the
	 * transaction to avoid duplicate numbers in simultaneous requests.
	 */
	private async createInvoiceWithItems(
		tx: Prisma.TransactionClient,
		params: {
			workspaceId: string;
			clientId: string;
			dueDate: Date;
			items: {
				description: string;
				quantity: number;
				unitPrice: number;
				amount: number;
				projectId?: string;
			}[];
		}
	) {
		const count = await tx.invoice.count({
			where: { workspaceId: params.workspaceId },
		});
		const number = `INV-${String(count + 1).padStart(4, '0')}`;

		const subtotal = params.items.reduce((sum, i) => sum + i.amount, 0);
		const tax = 0; // adjustable later according to region/workspace settings
		const total = subtotal + tax;

		return tx.invoice.create({
			data: {
				workspaceId: params.workspaceId,
				clientId: params.clientId,
				number,
				dueDate: params.dueDate,
				subtotal,
				tax,
				total,
				items: { create: params.items },
			},
			include: { items: true },
		});
	}
}
