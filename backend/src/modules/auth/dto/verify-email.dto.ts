import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	token: string;
}
