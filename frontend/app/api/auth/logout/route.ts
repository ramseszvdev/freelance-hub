import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import { clearSessionCookies, getRefreshToken } from '@/lib/session';

export async function POST() {
	const refreshToken = await getRefreshToken();

	if (refreshToken) {
		// Best-effort: if this fails, we still clear the cookies locally.
		// We don't want a network error to leave the user "stuck" logged in.
		await apiFetch('/auth/logout', {
			method: 'POST',
			body: JSON.stringify({ refreshToken }),
		}).catch(() => null);
	}

	await clearSessionCookies();

	return NextResponse.json({ success: true });
}
