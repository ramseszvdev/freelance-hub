import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'fh_access_token';
const REFRESH_TOKEN_COOKIE = 'fh_refresh_token';

/**
 * Shared configuration for session cookies. httpOnly: true is the
 * key piece — it ensures that document.cookie in the browser can NEVER
 * read these values, not even with a malicious injected script (XSS).
 * Only the Next.js server can read them.
 */
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	path: '/',
};

export async function setSessionCookies(tokens: {
	accessToken: string;
	refreshToken: string;
}) {
	const cookieStore = await cookies();

	// The accessToken has a short lifespan (matches JWT_ACCESS_EXPIRATION from the backend).
	cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 15, // 15 minutos
	});

	// The refreshToken lives longer — matches JWT_REFRESH_EXPIRATION.
	cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 60 * 24 * 7, // 7 días
	});
}

export async function getAccessToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearSessionCookies() {
	const cookieStore = await cookies();
	cookieStore.delete(ACCESS_TOKEN_COOKIE);
	cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
