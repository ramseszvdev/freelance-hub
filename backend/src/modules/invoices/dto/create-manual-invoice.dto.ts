import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	ValidateNested,
} from 'class-validator';

export class ManualInvoiceItemDto {
	@ApiProperty({ example: 'Logo design' })
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({ example: 1 })
	@IsNumber()
	@IsPositive()
	quantity: number;

	@ApiProperty({ example: 300.0 })
	@IsNumber()
	@IsPositive()
	unitPrice: number;

	@ApiProperty({ required: false, example: 'project-uuid' })
	@IsOptional()
	@IsUUID()
	projectId?: string;
}

export class CreateManualInvoiceDto {
	@ApiProperty({ example: 'client-uuid' })
	@IsUUID()
	@IsNotEmpty()
	clientId: string;

	@ApiProperty({ example: '2026-09-10T00:00:00.000Z' })
	@IsDateString()
	dueDate: string;

	@ApiProperty({ type: [ManualInvoiceItemDto] })
	@IsArray()
	@ArrayMinSize(1, { message: 'Invoice must have at least one item' })
	@ValidateNested({ each: true })
	@Type(() => ManualInvoiceItemDto)
	items: ManualInvoiceItemDto[];
}
