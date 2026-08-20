import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() makes PrismaService available in ALL modules
 * without having to import PrismaModule in each one. It's the only reasonable
 * exception to "explicitly import what you use" — access to the DB
 * is so cross-cutting that it makes sense to always have it available.
 */
@Global()
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
