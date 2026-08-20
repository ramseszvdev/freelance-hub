import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';

export class CreateManualEntryDto {
	@ApiProperty({ example: 'project-uuid' })
	@IsUUID()
	@IsNotEmpty()
	projectId: string;

	@ApiPropertyOptional({ example: 'Responsive design settings' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: '2026-08-10T09:00:00.000Z' })
	@IsDateString({}, { message: 'startedAt must be a valid ISO date' })
	startedAt: string;

	@ApiProperty({ example: '2026-08-10T11:30:00.000Z' })
	@IsDateString({}, { message: 'endedAt must be a valid ISO date' })
	endedAt: string;
}
