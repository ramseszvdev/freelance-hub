import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * This guard is registered GLOBALLY (see auth.module.ts / app.module.ts),
 * which means that EVERY route requires a valid JWT by default.
 *
 * "Secure by default": it is much easier to forget to secure a
 * new endpoint than to forget to mark it as public.
 * This pattern flips the risk in your favor..
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()]
		);

		if (isPublic) return true;

		return super.canActivate(context);
	}
}
