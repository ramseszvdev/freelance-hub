import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartTimerDto {
	@ApiProperty({ example: 'project-uuid' })
	@IsUUID()
	@IsNotEmpty()
	projectId: string;

	@ApiPropertyOptional({ example: 'Kickoff meeting with the client' })
	@IsOptional()
	@IsString()
	description?: string;
}
