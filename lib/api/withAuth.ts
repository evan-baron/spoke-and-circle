import { NextRequest, NextResponse } from 'next/server';
import { applyPublicRateLimit, applyRateLimit } from '@/lib/rateLimit';
import type { RateLimitBucket } from '@/lib/rateLimitConfig';
import { getApiUser } from '@/services/getUserService';
import { json403, json500, jsonAuthError } from './responses';

type AuthenticatedUser = NonNullable<
	Awaited<ReturnType<typeof getApiUser>>['user']
>;

type RouteParams = Record<string, string | string[]>;

interface RouteContext {
	params: Promise<RouteParams>;
}

type AuthenticatedHandler = (
	request: NextRequest,
	user: AuthenticatedUser,
	params?: RouteParams,
) => Promise<NextResponse>;

type PublicHandler = (
	request: NextRequest,
	params?: RouteParams,
) => Promise<NextResponse>;

function handleRouteError(request: NextRequest, error: unknown) {
	console.error(
		`Route error [${request.method} ${request.nextUrl.pathname}]:`,
		error,
	);
	return json500('Internal server error');
}

export function withAuth(
	options: { rateLimit: RateLimitBucket },
	handler: AuthenticatedHandler,
) {
	return async (request: NextRequest, context: RouteContext) => {
		try {
			const { user, error } = await getApiUser();
			if (error) return jsonAuthError(error);
			if (!user.active) return json403('Account is disabled');

			const rateLimited = await applyRateLimit(user, options.rateLimit);
			if (rateLimited) return rateLimited;

			const params = await context.params;
			return await handler(request, user, params);
		} catch (error) {
			return handleRouteError(request, error);
		}
	};
}

export function withPublicRateLimit(
	bucket: RateLimitBucket,
	handler: PublicHandler,
) {
	return async (request: NextRequest, context: RouteContext) => {
		try {
			const rateLimited = await applyPublicRateLimit(request, bucket);
			if (rateLimited) return rateLimited;

			const params = await context.params;
			return await handler(request, params);
		} catch (error) {
			return handleRouteError(request, error);
		}
	};
}
