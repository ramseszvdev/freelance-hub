import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CheckoutPlan } from './dto/create-checkout-session.dto';
import { EnvConfig } from '../../config/env.validation';

@Injectable()
export class BillingService {
	private readonly logger = new Logger(BillingService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService<EnvConfig, true>
	) {}

	async createCheckoutSession(workspaceId: string, plan: CheckoutPlan) {
		const subscription = await this.prisma.subscription.findUnique({
			where: { workspaceId },
			include: { workspace: true },
		});

		if (!subscription) {
			throw new NotFoundException(
				'Workspace without associated subscription'
			);
		}

		// Reuse the Stripe customer if it already exists (avoids duplicating customers
		// every time someone tries to pay/change their plan).
		let stripeCustomerId = subscription.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await this.stripeService.client.customers.create({
				metadata: { workspaceId },
			});
			stripeCustomerId = customer.id;

			await this.prisma.subscription.update({
				where: { workspaceId },
				data: { stripeCustomerId },
			});
		}

		const priceId =
			plan === CheckoutPlan.PRO
				? this.configService.get('STRIPE_PRICE_ID_PRO', { infer: true })
				: this.configService.get('STRIPE_PRICE_ID_BUSINESS', {
						infer: true,
					});

		const frontendUrl = this.configService.get('FRONTEND_URL', {
			infer: true,
		});

		const session = await this.stripeService.client.checkout.sessions.create({
			customer: stripeCustomerId,
			mode: 'subscription',
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${frontendUrl}/billing/cancelled`,
			// We also save the workspaceId here: when the webhook arrives,
			// this way we know which workspace it belongs to WITHOUT relying solely
			// on the customer id (extra safety).
			metadata: { workspaceId },
			subscription_data: {
				metadata: { workspaceId },
			},
		});

		if (!session.url) {
			throw new BadRequestException(
				'Payment session could not be generated'
			);
		}

		return { checkoutUrl: session.url };
	}

	/**
	 * Verifies the webhook signature and dispatches according to the event type.
	 * rawBody MUST be the unparsed Buffer (see main.ts: rawBody: true).
	 */
	async handleWebhookEvent(rawBody: Buffer, signature: string) {
		const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', {
			infer: true,
		});

		let event: Stripe.Event;
		try {
			event = this.stripeService.client.webhooks.constructEvent(
				rawBody,
				signature,
				webhookSecret
			);
		} catch (err) {
			this.logger.warn(
				`Invalid webhook signature: ${(err as Error).message}`
			);
			throw new BadRequestException('Invalid webhook signature');
		}

		this.logger.log(`Webhook received: ${event.type}`);

		switch (event.type) {
			case 'checkout.session.completed':
				await this.onCheckoutCompleted(
					event.data.object as Stripe.Checkout.Session
				);
				break;

			case 'customer.subscription.updated':
				await this.onSubscriptionUpdated(
					event.data.object as Stripe.Subscription
				);
				break;

			case 'customer.subscription.deleted':
				await this.onSubscriptionDeleted(
					event.data.object as Stripe.Subscription
				);
				break;

			case 'invoice.payment_failed':
				await this.onPaymentFailed(event.data.object as Stripe.Invoice);
				break;

			default:
				// We ignore events that don’t interest us, without failing.
				break;
		}

		return { received: true };
	}

	private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
		const workspaceId = session.metadata?.workspaceId;
		if (!workspaceId || typeof session.subscription !== 'string') return;

		const stripeSubscription =
			await this.stripeService.client.subscriptions.retrieve(
				session.subscription
			);

		await this.syncSubscriptionFromStripe(workspaceId, stripeSubscription);
	}

	private async onSubscriptionUpdated(
		stripeSubscription: Stripe.Subscription
	) {
		const workspaceId = stripeSubscription.metadata?.workspaceId;
		if (!workspaceId) return;

		await this.syncSubscriptionFromStripe(workspaceId, stripeSubscription);
	}

	private async onSubscriptionDeleted(
		stripeSubscription: Stripe.Subscription
	) {
		const workspaceId = stripeSubscription.metadata?.workspaceId;
		if (!workspaceId) return;

		await this.prisma.subscription.update({
			where: { workspaceId },
			data: { plan: 'FREE', status: 'CANCELLED' },
		});
	}

	private async onPaymentFailed(invoice: Stripe.Invoice) {
		const customerId =
			typeof invoice.customer === 'string'
				? invoice.customer
				: invoice.customer?.id;
		if (!customerId) return;

		const subscription = await this.prisma.subscription.findUnique({
			where: { stripeCustomerId: customerId },
		});
		if (!subscription) return;

		await this.prisma.subscription.update({
			where: { workspaceId: subscription.workspaceId },
			data: { status: 'PAST_DUE' },
		});
	}

	private async syncSubscriptionFromStripe(
		workspaceId: string,
		stripeSubscription: Stripe.Subscription
	) {
		const priceId = stripeSubscription.items.data[0]?.price.id;
		const plan = this.resolvePlanFromPriceId(priceId);

		await this.prisma.subscription.update({
			where: { workspaceId },
			data: {
				plan,
				status: this.mapStripeStatus(stripeSubscription.status),
				stripeSubscriptionId: stripeSubscription.id,
				currentPeriodEnd: new Date(
					stripeSubscription.current_period_end * 1000
				),
			},
		});
	}

	private resolvePlanFromPriceId(
		priceId?: string
	): 'PRO' | 'BUSINESS' | 'FREE' {
		if (
			priceId ===
			this.configService.get('STRIPE_PRICE_ID_PRO', { infer: true })
		) {
			return 'PRO';
		}
		if (
			priceId ===
			this.configService.get('STRIPE_PRICE_ID_BUSINESS', { infer: true })
		) {
			return 'BUSINESS';
		}
		return 'FREE';
	}

	private mapStripeStatus(
		status: Stripe.Subscription.Status
	): 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' {
		switch (status) {
			case 'active':
				return 'ACTIVE';
			case 'past_due':
			case 'unpaid':
				return 'PAST_DUE';
			case 'trialing':
				return 'TRIALING';
			default:
				return 'CANCELLED';
		}
	}
}
