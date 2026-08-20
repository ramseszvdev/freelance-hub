import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { EnvConfig } from '../../../config/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService<EnvConfig, true>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
		});
	}

	/**
	 * What we return here is what NestJS injects as `request.user`
	 * in any protected endpoint. Passport has already validated the token's
	 * signature and expiration before reaching here.
	 */
	validate(payload: JwtPayload): JwtPayload {
		return payload;
	}
}
