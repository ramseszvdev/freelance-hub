import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateFromProjectDto {
	@ApiProperty({ example: 'project-uuid' })
	@IsUUID()
	@IsNotEmpty()
	projectId: string;

	@ApiProperty({ example: '2026-09-10T00:00:00.000Z' })
	@IsDateString({}, { message: 'dueDate must be a valid ISO date' })
	dueDate: string;
}
