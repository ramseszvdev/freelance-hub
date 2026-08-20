import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { EnvConfig } from '../../config/env.validation';

/**
 * Wraps the Stripe SDK as an injectable provider.
 * No other service should import 'stripe' directly —
 * everything goes through here, so there's only one place that knows the API version
 * and the client config.
 */
@Injectable()
export class StripeService {
	public readonly client: Stripe;

	constructor(configService: ConfigService<EnvConfig, true>) {
		this.client = new Stripe(
			configService.get('STRIPE_SECRET_KEY', { infer: true }),
			{
				apiVersion: '2025-02-24.acacia',
			}
		);
	}
}
