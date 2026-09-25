import { NextResponse } from 'next/server';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { rejectTeamSchema } from '@/lib/validation';
import { rejectPendingTeam } from '@/services/teamAdminService';

export const DELETE = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, _user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request, { allowEmpty: true });
		if ('error' in result) return result.error;

		const parsed = rejectTeamSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const rejected = await rejectPendingTeam(
			teamId,
			parsed.data.reason || undefined,
		);
		if (!rejected) return json404('Pending team not found');

		return NextResponse.json({ success: true });
	},
);
