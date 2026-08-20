import { NextRequest, NextResponse } from 'next/server';
import {
	getAccessToken,
	getRefreshToken,
	setSessionCookies,
	clearSessionCookies,
} from '@/lib/session';

const BACKEND_URL =
	process.env.BACKEND_API_URL ?? 'http://localhost:3333/api/v1';

/**
 * Module-level lock: if several concurrent requests detect
 * a 401 at the same time, ALL of them share this same refresh promise
 * instead of each triggering their own POST /auth/refresh. Since
 * refresh tokens rotate (they're revoked when used), without this lock
 * only the first call would succeed and the rest would fail with 401.
 */
let refreshPromise: Promise<string | null> | null = null;

async function callBackend(
	path: string,
	search: string,
	method: string,
	body: string | undefined,
	token: string | undefined
) {
	return fetch(`${BACKEND_URL}/${path}${search}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
		},
		body,
		cache: 'no-store',
	});
}

async function doRefresh(): Promise<string | null> {
	const refreshToken = await getRefreshToken();
	if (!refreshToken) return null;

	const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refreshToken }),
		cache: 'no-store',
	});

	if (!res.ok) {
		await clearSessionCookies();
		return null;
	}

	const tokens = await res.json();
	await setSessionCookies(tokens);
	return tokens.accessToken;
}

/**
 * Entry point for the refresh: if one is already in progress, all
 * concurrent callers wait for THAT SAME promise (they don't create a
 * new one). Only the first one to arrive actually triggers the POST.
 */
async function getRefreshedToken(): Promise<string | null> {
	if (!refreshPromise) {
		refreshPromise = doRefresh().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

async function proxy(request: NextRequest, path: string[]) {
	const targetPath = path.join('/');
	const search = request.nextUrl.search;
	const body =
		request.method !== 'GET' && request.method !== 'DELETE'
			? await request.text()
			: undefined;

	const token = await getAccessToken();
	let response = await callBackend(
		targetPath,
		search,
		request.method,
		body,
		token
	);

	if (response.status === 401) {
		const newToken = await getRefreshedToken();

		if (newToken) {
			response = await callBackend(
				targetPath,
				search,
				request.method,
				body,
				newToken
			);
		}
	}

	if (response.status === 204) {
		return new NextResponse(null, { status: 204 });
	}

	const data = await response.json();
	return NextResponse.json(data, { status: response.status });
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return proxy(request, (await params).path);
}
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return proxy(request, (await params).path);
}
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return proxy(request, (await params).path);
}
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return proxy(request, (await params).path);
}
