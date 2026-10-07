import { NextResponse } from 'next/server';
import { jsonError, withAuth } from '@/lib/api';
import { signMediaUpload } from '@/lib/cloudinary';

export const POST = withAuth({ rateLimit: 'media-sign' }, async (_request, user) => {
	const signed = signMediaUpload(user.id);
	if (!signed) return jsonError('Photo uploads are unavailable', 503);

	return NextResponse.json({ success: true, ...signed });
});
