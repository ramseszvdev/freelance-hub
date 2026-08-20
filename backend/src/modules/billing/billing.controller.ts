import {
	Body,
	Controller,
	Headers,
	HttpCode,
	HttpStatus,
	Post,
	RawBodyRequest,
	Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('billing')
@Controller({ path: 'billing', version: '1' })
export class BillingController {
	constructor(private readonly billingService: BillingService) {}

	@Post('checkout-session')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a Stripe Checkout session to upgrade the plan',
	})
	createCheckoutSession(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateCheckoutSessionDto
	) {
		return this.billingService.createCheckoutSession(
			user.workspaceId,
			dto.plan
		);
	}

	/**
	 * Public endpoint (Stripe doesn't send JWT, it sends its own signature).
	 * CRITICAL: use @Req() to access req.rawBody, NOT @Body() —
	 * @Body() would give you the JSON already parsed, and Stripe's
	 * signature verification needs the EXACT bytes exactly as Stripe sent them.
	 */
	@Public()
	@Post('webhook')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			'Receives events from Stripe (internal Stripe use, do not call manually)',
	})
	handleWebhook(
		@Req() req: RawBodyRequest<Request>,
		@Headers('stripe-signature') signature: string
	) {
		if (!req.rawBody) {
			throw new Error(
				'rawBody not available — check that rawBody: true is in main.ts'
			);
		}
		return this.billingService.handleWebhookEvent(req.rawBody, signature);
	}
}
