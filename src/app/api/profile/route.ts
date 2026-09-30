import { NextResponse } from 'next/server';
import { jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { profileNameSchema } from '@/lib/validation';
import { updateUserName } from '@/services/userService';

export const PUT = withAuth(
	{ rateLimit: 'profile-write' },
	async (request, user) => {
		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const parsed = profileNameSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const updated = await updateUserName(
			user.id,
			parsed.data.firstName,
			parsed.data.lastName || null,
		);

		return NextResponse.json({ success: true, profile: updated });
	},
);
