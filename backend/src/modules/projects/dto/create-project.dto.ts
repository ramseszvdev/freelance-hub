import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

export enum ProjectStatusDto {
	ACTIVE = 'ACTIVE',
	PAUSED = 'PAUSED',
	COMPLETED = 'COMPLETED',
	ARCHIVED = 'ARCHIVED',
}

export enum BillingTypeDto {
	HOURLY = 'HOURLY',
	FIXED = 'FIXED',
}

export class CreateProjectDto {
	@ApiProperty({ example: 'client-uuid' })
	@IsUUID()
	clientId: string;

	@ApiProperty({ example: 'Website redesign' })
	@IsString()
	@IsNotEmpty({ message: 'Name is required' })
	name: string;

	@ApiPropertyOptional({
		example: 'Complete redesign with a new design system',
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ enum: BillingTypeDto, example: BillingTypeDto.HOURLY })
	@IsEnum(BillingTypeDto, { message: 'billingType must be HOURLY or FIXED' })
	billingType: BillingTypeDto;

	@ApiPropertyOptional({
		example: 45.0,
		description: 'Required if billingType = HOURLY',
	})
	@ValidateIf(
		(dto: CreateProjectDto) => dto.billingType === BillingTypeDto.HOURLY
	)
	@IsNumber({}, { message: 'hourlyRate must be a number' })
	@IsPositive({ message: 'hourlyRate must be greater than 0' })
	hourlyRate?: number;

	@ApiPropertyOptional({
		example: 2500.0,
		description: 'Required if billingType = FIXED',
	})
	@ValidateIf(
		(dto: CreateProjectDto) => dto.billingType === BillingTypeDto.FIXED
	)
	@IsNumber({}, { message: 'fixedPrice must be a number' })
	@IsPositive({ message: 'fixedPrice must be greater than 0' })
	fixedPrice?: number;
}
