import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
	@ApiProperty({ example: 'Creative Studio SA' })
	@IsString()
	@IsNotEmpty({ message: 'The name is required' })
	name: string;

	@ApiPropertyOptional({ example: 'contact@creativestudio.com' })
	@IsOptional()
	@IsEmail({}, { message: 'Email does not have a valid format' })
	email?: string;

	@ApiPropertyOptional({ example: 'Creative Studio SA' })
	@IsOptional()
	@IsString()
	company?: string;

	@ApiPropertyOptional({
		example: 'Repeat customer, prefers payments by bank transfer',
	})
	@IsOptional()
	@IsString()
	notes?: string;
}
