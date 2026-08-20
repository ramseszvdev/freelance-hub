import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark an endpoint as public, bypassing the global JwtAuthGuard.
 * Usage: @Public() above @Post('login') in the Auth controller.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
