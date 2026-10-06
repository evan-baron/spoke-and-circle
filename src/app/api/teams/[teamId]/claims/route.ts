import { NextResponse } from 'next/server';
import {
	json400,
	json403,
	json404,
	jsonError,
	jsonValidationError,
	withAuth,
} from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { claimSchema } from '@/lib/claimValidation';
import { createClaim } from '@/services/teamClaimService';

const MAX_BODY_BYTES = 20 * 1024;

export const POST = withAuth(
	{ rateLimit: 'claims-write' },
	async (request, user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		if (user.role === 'admin') {
			return json403('Admins can already manage every group');
		}

		const result = await readJsonObject(request, { maxBytes: MAX_BODY_BYTES });
		if ('error' in result) return result.error;

		const parsed = claimSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const outcome = await createClaim(teamId, user.id, parsed.data.message);

		switch (outcome) {
			case 'team_not_found':
				return json404('Team not found');
			case 'not_claimable':
				return json403('This group can no longer be claimed');
			case 'already_pending':
				return jsonError('You already have a pending claim for this group', 409);
			case 'created':
				return NextResponse.json({ success: true }, { status: 201 });
		}
	},
);
