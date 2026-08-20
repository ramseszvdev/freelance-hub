import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionCookies } from '@/lib/session';

interface RegisterBody {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	workspaceName: string;
}

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

export async function POST(request: NextRequest) {
	const body: RegisterBody = await request.json();

	try {
		const tokens = await apiFetch<TokenPair>('/auth/register', {
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
			{ message: 'Error inesperado' },
			{ status: 500 }
		);
	}
}
