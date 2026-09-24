import { NextResponse } from 'next/server';
import { z } from 'zod';
import { json500, jsonValidationError, withPublicRateLimit } from '@/lib/api';
import { searchUsLocations } from '@/lib/locations';

const querySchema = z.object({
	q: z
		.string()
		.trim()
		.min(2, 'Search must be at least 2 characters')
		.max(100, 'Search must be less than 100 characters'),
});

export const GET = withPublicRateLimit('locations-search', async (request) => {
	const parsed = querySchema.safeParse({
		q: request.nextUrl.searchParams.get('q') ?? '',
	});
	if (!parsed.success) return jsonValidationError(parsed.error);

	try {
		const locations = await searchUsLocations(parsed.data.q);
		return NextResponse.json({ success: true, locations });
	} catch (error) {
		console.error('Error searching locations:', error);
		return json500('Failed to search locations');
	}
});
