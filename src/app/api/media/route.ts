import { NextResponse } from 'next/server';
import { json400, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { destroyImages } from '@/lib/cloudinary';
import { MEDIA_PUBLIC_ID_PATTERN, mediaOwnerPrefix } from '@/lib/media';
import { prisma } from '@/lib/prisma';

export const DELETE = withAuth(
	{ rateLimit: 'media-sign' },
	async (request, user) => {
		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const publicId = result.body.publicId;
		if (
			typeof publicId !== 'string' ||
			!MEDIA_PUBLIC_ID_PATTERN.test(publicId) ||
			!publicId.startsWith(mediaOwnerPrefix(user.id))
		) {
			return json400('Invalid photo');
		}

		const attached = await prisma.teamMedia.count({ where: { publicId } });
		if (attached > 0) return json400('That photo is already saved to a team');

		await destroyImages([publicId]);
		return NextResponse.json({ success: true });
	},
);
