import { NextResponse } from 'next/server';
import { z } from 'zod';
import { json500, jsonValidationError, withPublicRateLimit } from '@/lib/api';
import { searchPlaces } from '@/services/placeService';

const querySchema = z.object({
	q: z
		.string()
		.trim()
		.min(2, 'Search must be at least 2 characters')
		.max(100, 'Search must be less than 100 characters'),
	zip: z.enum(['1']).optional(),
});

export const GET = withPublicRateLimit('locations-search', async (request) => {
	const parsed = querySchema.safeParse({
		q: request.nextUrl.searchParams.get('q') ?? '',
		zip: request.nextUrl.searchParams.get('zip') ?? undefined,
	});
	if (!parsed.success) return jsonValidationError(parsed.error);

	try {
		const locations = await searchPlaces(parsed.data.q, {
			includeZip: parsed.data.zip === '1',
		});
		return NextResponse.json({ success: true, locations });
	} catch (error) {
		console.error('Error searching locations:', error);
		return json500('Failed to search locations');
	}
});
