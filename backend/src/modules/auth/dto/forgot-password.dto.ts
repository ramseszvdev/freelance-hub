import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
	@ApiProperty({ example: 'ana@studio.com' })
	@IsEmail()
	email: string;
}
