import { getAccessToken } from './session';

const BACKEND_URL =
	process.env.BACKEND_API_URL ?? 'http://localhost:3333/api/v1';

export class ApiError extends Error {
	constructor(
		public statusCode: number,
		message: string
	) {
		super(message);
	}
}

interface FetchOptions extends RequestInit {
	/** If true, it does NOT attach the accessToken (for login/register/refresh). */
	skipAuth?: boolean;
}

/**
 * Fetch wrapper to call NestJS FROM the Next.js SERVER
 * (Route Handlers, Server Components, Server Actions). It's never used
 * directly from the browser — that's why it can read the httpOnly
 * cookie with getAccessToken() without any problem.
 */
export async function apiFetch<T>(
	path: string,
	options: FetchOptions = {}
): Promise<T> {
	const { skipAuth, headers, ...rest } = options;

	const finalHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...(headers as Record<string, string>),
	};

	if (!skipAuth) {
		const token = await getAccessToken();
		if (token) {
			finalHeaders['Authorization'] = `Bearer ${token}`;
		}
	}

	const response = await fetch(`${BACKEND_URL}${path}`, {
		...rest,
		headers: finalHeaders,
		cache: 'no-store',
	});

	if (!response.ok) {
		const body = await response
			.json()
			.catch(() => ({ message: response.statusText }));
		throw new ApiError(response.status, body.message ?? 'Fetching Error');
	}

	// 204 No Content does not have a body
	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}
