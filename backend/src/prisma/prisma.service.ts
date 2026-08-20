import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps PrismaClient as an injectable NestJS provider.
 *
 * - onModuleInit: connects to the DB when the app starts (fails fast
 * if the DB is not available, instead of failing on the first query).
 * - onModuleDestroy: cleanly closes the connection when shutting down the app
 * (important to avoid leaving hanging connections on each redeploy).
 */
@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	constructor() {
		super({
			log:
				process.env.NODE_ENV === 'development'
					? ['warn', 'error']
					: ['error'],
		});
	}

	async onModuleInit() {
		await this.$connect();
		this.logger.log('✅ Connected to the database');
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
