import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

const ALLOWED_ORIGIN = new URL(
	process.env.APP_BASE_URL || 'http://localhost:3000',
).origin;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function applyCorsHeaders(request: NextRequest, response: NextResponse) {
	if (request.headers.get('origin') === ALLOWED_ORIGIN) {
		response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		response.headers.append('Vary', 'Origin');
	}
	return response;
}

function handleApiPreflight(request: NextRequest) {
	const response = new NextResponse(null, { status: 204 });

	if (request.headers.get('origin') === ALLOWED_ORIGIN) {
		response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
		response.headers.set(
			'Access-Control-Allow-Methods',
			'GET, POST, PUT, PATCH, DELETE, OPTIONS',
		);
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		response.headers.set('Access-Control-Max-Age', '86400');
		response.headers.append('Vary', 'Origin');
	}

	return response;
}

function isCrossOriginMutation(request: NextRequest) {
	if (!MUTATING_METHODS.has(request.method)) return false;
	const origin = request.headers.get('origin');
	return origin !== null && origin !== ALLOWED_ORIGIN;
}

export async function middleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith('/api/')) {
		if (request.method === 'OPTIONS') {
			return handleApiPreflight(request);
		}

		if (isCrossOriginMutation(request)) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const authResponse = await auth0.middleware(request);
		return applyCorsHeaders(request, authResponse);
	}

	return auth0.middleware(request);
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
