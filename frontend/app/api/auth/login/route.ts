import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionCookies } from '@/lib/session';

interface LoginBody {
	email: string;
	password: string;
}

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

export async function POST(request: NextRequest) {
	const body: LoginBody = await request.json();

	try {
		const tokens = await apiFetch<TokenPair>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(body),
			skipAuth: true,
		});

		await setSessionCookies(tokens);

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(
				{ message: error.message },
				{ status: error.statusCode }
			);
		}
		return NextResponse.json(
			{ message: 'Unexpected error' },
			{ status: 500 }
		);
	}
}
