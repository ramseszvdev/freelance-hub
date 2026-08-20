import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({ example: 'ana@studio.com' })
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	@MinLength(1, { message: 'Password is required' })
	password: string;
}
