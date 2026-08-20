import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
	let invoicesService: InvoicesService;
	let prismaMock: any;

	beforeEach(() => {
		prismaMock = {
			project: { findFirst: jest.fn() },
			client: { findFirst: jest.fn() },
			timeEntry: { findMany: jest.fn(), updateMany: jest.fn() },
			invoice: {
				count: jest.fn(),
				create: jest.fn(),
				findFirst: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			},
			$transaction: jest.fn((arg: any) => {
				if (Array.isArray(arg)) return Promise.all(arg);
				return arg(prismaMock);
			}),
		};

		invoicesService = new InvoicesService(prismaMock);
	});

	describe('generateFromProject', () => {
		it('throw NotFoundException if the project does not exist in the workspace', async () => {
			prismaMock.project.findFirst.mockResolvedValue(null);

			await expect(
				invoicesService.generateFromProject('workspace-1', {
					projectId: 'project-1',
					dueDate: '2026-09-10T00:00:00.000Z',
				})
			).rejects.toThrow(NotFoundException);
		});

		it('throw BadRequestException if there are no unbilled hours', async () => {
			prismaMock.project.findFirst.mockResolvedValue({
				id: 'project-1',
				billingType: 'HOURLY',
				hourlyRate: 45,
				clientId: 'client-1',
			});
			prismaMock.timeEntry.findMany.mockResolvedValue([]);

			await expect(
				invoicesService.generateFromProject('workspace-1', {
					projectId: 'project-1',
					dueDate: '2026-09-10T00:00:00.000Z',
				})
			).rejects.toThrow(BadRequestException);
		});

		it('calculate the correct amount for an HOURLY project (hours × rate)', async () => {
			prismaMock.project.findFirst.mockResolvedValue({
				id: 'project-1',
				name: 'Website redesign',
				billingType: 'HOURLY',
				hourlyRate: 45,
				clientId: 'client-1',
			});
			// 2 entries of 90 min each = 180 min = exactly 3 hours
			prismaMock.timeEntry.findMany.mockResolvedValue([
				{ id: 'entry-1', durationMin: 90 },
				{ id: 'entry-2', durationMin: 90 },
			]);
			prismaMock.invoice.count.mockResolvedValue(0);
			prismaMock.invoice.create.mockImplementation(({ data }: any) => ({
				...data,
				items: data.items.create,
			}));

			const result = await invoicesService.generateFromProject(
				'workspace-1',
				{
					projectId: 'project-1',
					dueDate: '2026-09-10T00:00:00.000Z',
				}
			);

			// 3 hours × $45/h = $135
			expect(result.items[0]).toMatchObject({
				quantity: 3,
				unitPrice: 45,
				amount: 135,
			});
			expect(result.subtotal).toBe(135);
			expect(result.total).toBe(135);

			// The hours used must be marked as billed.
			expect(prismaMock.timeEntry.updateMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: { in: ['entry-1', 'entry-2'] } },
					data: { billed: true },
				})
			);
		});

		it('use the full fixed price for a FIXED project, no matter the hours', async () => {
			prismaMock.project.findFirst.mockResolvedValue({
				id: 'project-1',
				name: 'Logo nuevo',
				billingType: 'FIXED',
				fixedPrice: 300,
				clientId: 'client-1',
			});
			prismaMock.timeEntry.findMany.mockResolvedValue([
				{ id: 'entry-1', durationMin: 45 },
			]);
			prismaMock.invoice.count.mockResolvedValue(0);
			prismaMock.invoice.create.mockImplementation(({ data }: any) => ({
				...data,
				items: data.items.create,
			}));

			const result = await invoicesService.generateFromProject(
				'workspace-1',
				{
					projectId: 'project-1',
					dueDate: '2026-09-10T00:00:00.000Z',
				}
			);

			expect(result.items[0]).toMatchObject({
				quantity: 1,
				unitPrice: 300,
				amount: 300,
			});
			expect(result.total).toBe(300);
		});
	});

	describe('sequential numbering of invoices', () => {
		it('generate INV-0006 when there are already 5 invoices in the workspace', async () => {
			prismaMock.project.findFirst.mockResolvedValue({
				id: 'project-1',
				name: 'Proyecto X',
				billingType: 'FIXED',
				fixedPrice: 100,
				clientId: 'client-1',
			});
			prismaMock.timeEntry.findMany.mockResolvedValue([
				{ id: 'entry-1', durationMin: 60 },
			]);
			prismaMock.invoice.count.mockResolvedValue(5);
			prismaMock.invoice.create.mockImplementation(({ data }: any) => ({
				...data,
				items: data.items.create,
			}));

			const result = await invoicesService.generateFromProject(
				'workspace-1',
				{
					projectId: 'project-1',
					dueDate: '2026-09-10T00:00:00.000Z',
				}
			);

			expect(result.number).toBe('INV-0006');
		});
	});

	describe('createManual', () => {
		it('throw NotFoundException if the client does not exist in the workspace', async () => {
			prismaMock.client.findFirst.mockResolvedValue(null);

			await expect(
				invoicesService.createManual('workspace-1', {
					clientId: 'nonexistent-client',
					dueDate: '2026-09-10T00:00:00.000Z',
					items: [
						{
							description: 'Logo design',
							quantity: 1,
							unitPrice: 300,
						},
					],
				})
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateStatus', () => {
		it('record paidAt when marking an invoice as PAID', async () => {
			prismaMock.invoice.findFirst.mockResolvedValue({
				id: 'invoice-1',
				workspaceId: 'workspace-1',
			});
			prismaMock.invoice.update.mockResolvedValue({
				id: 'invoice-1',
				status: 'PAID',
			});

			await invoicesService.updateStatus('workspace-1', 'invoice-1', {
				status: 'PAID' as any,
			});

			expect(prismaMock.invoice.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'PAID',
						paidAt: expect.any(Date),
					}),
				})
			);
		});
	});

	describe('remove', () => {
		it('throw BadRequestException if the invoice is not in DRAFT', async () => {
			prismaMock.invoice.findFirst.mockResolvedValue({
				id: 'invoice-1',
				workspaceId: 'workspace-1',
				status: 'SENT',
			});

			await expect(
				invoicesService.remove('workspace-1', 'invoice-1')
			).rejects.toThrow(BadRequestException);
			expect(prismaMock.invoice.delete).not.toHaveBeenCalled();
		});

		it('delete the invoice if it is in DRAFT', async () => {
			prismaMock.invoice.findFirst.mockResolvedValue({
				id: 'invoice-1',
				workspaceId: 'workspace-1',
				status: 'DRAFT',
			});

			await invoicesService.remove('workspace-1', 'invoice-1');

			expect(prismaMock.invoice.delete).toHaveBeenCalledWith({
				where: { id: 'invoice-1' },
			});
		});
	});
});
