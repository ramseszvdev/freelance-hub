import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InvoiceStatusDto {
	DRAFT = 'DRAFT',
	SENT = 'SENT',
	PAID = 'PAID',
	OVERDUE = 'OVERDUE',
	CANCELLED = 'CANCELLED',
}

export class UpdateInvoiceStatusDto {
	@ApiProperty({ enum: InvoiceStatusDto, example: InvoiceStatusDto.SENT })
	@IsEnum(InvoiceStatusDto)
	status: InvoiceStatusDto;
}
