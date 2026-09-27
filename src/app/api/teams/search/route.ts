import { NextResponse } from 'next/server';
import { z } from 'zod';
import { json500, jsonValidationError, withPublicRateLimit } from '@/lib/api';
import { searchAffiliatableTeams } from '@/services/teamSearchService';

const querySchema = z.object({
	q: z
		.string()
		.trim()
		.min(2, 'Search must be at least 2 characters')
		.max(100, 'Search must be less than 100 characters'),
	excludeId: z.string().trim().min(1).optional(),
});

export const GET = withPublicRateLimit('teams-search', async (request) => {
	const parsed = querySchema.safeParse({
		q: request.nextUrl.searchParams.get('q') ?? '',
		excludeId: request.nextUrl.searchParams.get('excludeId') ?? undefined,
	});
	if (!parsed.success) return jsonValidationError(parsed.error);

	try {
		const teams = await searchAffiliatableTeams(
			parsed.data.q,
			parsed.data.excludeId,
		);
		return NextResponse.json({ success: true, teams });
	} catch (error) {
		console.error('Error searching teams:', error);
		return json500('Failed to search teams');
	}
});
