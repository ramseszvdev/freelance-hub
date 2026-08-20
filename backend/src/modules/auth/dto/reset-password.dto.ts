import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	token: string;

	@ApiProperty({ example: 'Password123!' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message:
			'Password must include uppercase, lowercase and a number or symbol',
	})
	newPassword: string;
}
