import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum CheckoutPlan {
	PRO = 'PRO',
	BUSINESS = 'BUSINESS',
}

export class CreateCheckoutSessionDto {
	@ApiProperty({ enum: CheckoutPlan, example: CheckoutPlan.PRO })
	@IsEnum(CheckoutPlan)
	plan: CheckoutPlan;
}
