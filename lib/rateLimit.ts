import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
	RATE_LIMIT_CONFIG,
	type RateLimitActor,
	type RateLimitBucket,
} from './rateLimitConfig';

const CLEANUP_PROBABILITY = 0.01;
const CLEANUP_AGE_MS = 2 * 60 * 60 * 1000;

interface RateLimitResult {
	success: boolean;
	retryAfterSeconds: number;
}

async function checkRateLimit(
	identifier: string,
	bucket: RateLimitBucket,
	actor: RateLimitActor,
): Promise<RateLimitResult> {
	const { windowSeconds, maxRequests } = RATE_LIMIT_CONFIG[bucket];
	const max = maxRequests[actor];

	if (max <= 0) {
		return { success: false, retryAfterSeconds: windowSeconds };
	}

	const rows = await prisma.$queryRaw<{ count: number; retryAfter: number }[]>`
		INSERT INTO "RateLimit" ("identifier", "bucket", "windowStart", "count")
		VALUES (${identifier}, ${bucket}, (NOW() AT TIME ZONE 'UTC'), 1)
		ON CONFLICT ("identifier", "bucket") DO UPDATE SET
			"windowStart" = CASE
				WHEN "RateLimit"."windowStart" < (NOW() AT TIME ZONE 'UTC') - make_interval(secs => ${windowSeconds}::double precision)
				THEN (NOW() AT TIME ZONE 'UTC')
				ELSE "RateLimit"."windowStart"
			END,
			"count" = CASE
				WHEN "RateLimit"."windowStart" < (NOW() AT TIME ZONE 'UTC') - make_interval(secs => ${windowSeconds}::double precision)
				THEN 1
				ELSE "RateLimit"."count" + 1
			END
		RETURNING
			"count",
			EXTRACT(EPOCH FROM ("windowStart" + make_interval(secs => ${windowSeconds}::double precision) - (NOW() AT TIME ZONE 'UTC')))::float8 AS "retryAfter"
	`;

	if (Math.random() < CLEANUP_PROBABILITY) {
		void cleanupExpiredRateLimits().catch((error) => {
			console.error('Rate limit cleanup failed:', error);
		});
	}

	const row = rows[0];
	if (!row) throw new Error('Rate limit upsert returned no row');

	return {
		success: row.count <= max,
		retryAfterSeconds: Math.max(1, Math.ceil(row.retryAfter)),
	};
}

function getClientIp(req: NextRequest): string {
	const candidates = [
		req.headers.get('x-real-ip'),
		req.headers.get('x-forwarded-for')?.split(',')[0],
	];

	for (const candidate of candidates) {
		const ip = candidate?.trim();
		if (ip && isIP(ip)) return ip;
	}

	return 'unknown';
}

function buildRateLimitResponse(retryAfterSeconds: number): NextResponse {
	return NextResponse.json(
		{
			error: 'Too many requests. Please try again later.',
			retryAfter: retryAfterSeconds,
		},
		{
			status: 429,
			headers: {
				'Retry-After': String(retryAfterSeconds),
				'X-RateLimit-Remaining': '0',
			},
		},
	);
}

export async function applyRateLimit(
	user: { id: number; role: 'user' | 'admin' },
	bucket: RateLimitBucket,
): Promise<NextResponse | null> {
	const result = await checkRateLimit(`user:${user.id}`, bucket, user.role);
	return result.success ? null : buildRateLimitResponse(result.retryAfterSeconds);
}

export async function applyPublicRateLimit(
	req: NextRequest,
	bucket: RateLimitBucket,
): Promise<NextResponse | null> {
	const result = await checkRateLimit(
		`ip:${getClientIp(req)}`,
		bucket,
		'anonymous',
	);
	return result.success ? null : buildRateLimitResponse(result.retryAfterSeconds);
}

export async function cleanupExpiredRateLimits(): Promise<number> {
	const cutoff = new Date(Date.now() - CLEANUP_AGE_MS);
	const result = await prisma.rateLimit.deleteMany({
		where: { windowStart: { lt: cutoff } },
	});
	return result.count;
}
