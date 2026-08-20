import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		PassportModule,
		// JwtModule.register() without global config: each call to sign()/verify()
		// in AuthService passes its own secret explicitly (access vs refresh
		// use DIFFERENT secrets on purpose, so a stolen refresh token won't
		// work to forge access tokens and vice versa).
		JwtModule.register({}),
		UsersModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		// Registers JwtAuthGuard GLOBALLY: every route in the app requires
		// a valid JWT except those marked with @Public().
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
	exports: [AuthService],
})
export class AuthModule {}
