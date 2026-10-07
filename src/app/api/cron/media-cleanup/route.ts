import { timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { json500, jsonError } from '@/lib/api';
import { deleteStaleUploads } from '@/lib/cloudinary';

const MAX_UPLOAD_AGE_HOURS = 24;

function isAuthorized(request: NextRequest) {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;

	const expected = Buffer.from(`Bearer ${secret}`);
	const received = Buffer.from(request.headers.get('authorization') ?? '');
	return (
		expected.length === received.length && timingSafeEqual(expected, received)
	);
}

export async function GET(request: NextRequest) {
	if (!isAuthorized(request)) return jsonError('Unauthorized', 401);

	try {
		const deleted = await deleteStaleUploads(MAX_UPLOAD_AGE_HOURS);
		return NextResponse.json({ success: true, deleted });
	} catch (error) {
		console.error('Media cleanup failed:', error);
		return json500('Media cleanup failed');
	}
}
