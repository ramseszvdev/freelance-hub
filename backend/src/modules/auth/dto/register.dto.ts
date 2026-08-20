import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	Matches,
} from 'class-validator';

export class RegisterDto {
	@ApiProperty({ example: 'ana@studio.com' })
	@IsEmail({}, { message: 'Email is not in a valid format' })
	email: string;

	@ApiProperty({ example: 'Password123!' })
	@IsString()
	@MinLength(8, { message: 'Password must have at least 8 characters' })
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message:
			'Password must include uppercase, lowercase and a number or symbol',
	})
	password: string;

	@ApiProperty({ example: 'Ana' })
	@IsString()
	@IsNotEmpty({ message: 'First name is required' })
	firstName: string;

	@ApiProperty({ example: 'García' })
	@IsString()
	@IsNotEmpty({ message: 'Last name is required' })
	lastName: string;

	@ApiProperty({ example: "Ana's Studio" })
	@IsString()
	@IsNotEmpty({ message: 'Workspace name is required' })
	workspaceName: string;
}
