import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeService } from './stripe.service';
import { PlanLimitGuard } from './guard/plan-limit.guard';

@Module({
	controllers: [BillingController],
	providers: [
		BillingService,
		StripeService,
		{ provide: APP_GUARD, useClass: PlanLimitGuard },
	],
	exports: [BillingService, StripeService],
})
export class BillingModule {}
