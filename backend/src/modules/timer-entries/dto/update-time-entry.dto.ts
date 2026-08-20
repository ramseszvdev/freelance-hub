import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateTimeEntryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ example: '2026-08-10T09:00:00.000Z' })
	@IsOptional()
	@IsDateString()
	startedAt?: string;

	@ApiPropertyOptional({ example: '2026-08-10T11:30:00.000Z' })
	@IsOptional()
	@IsDateString()
	endedAt?: string;
}
