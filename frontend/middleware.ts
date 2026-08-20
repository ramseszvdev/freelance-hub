import { NextRequest, NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE = 'fh_refresh_token';

const AUTH_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
	const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);
	const { pathname } = request.nextUrl;

	const isProtectedRoute = pathname.startsWith('/dashboard');
	const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

	// Sin sesión intentando entrar al dashboard → afuera, a login.
	if (isProtectedRoute && !hasSession) {
		const loginUrl = new URL('/login', request.url);
		// Guardamos a dónde quería ir, para poder redirigirlo ahí después de loguearse.
		loginUrl.searchParams.set('redirectTo', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Con sesión activa intentando ver login/register → no tiene sentido, al dashboard.
	if (isAuthPage && hasSession) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/login', '/register'],
};
