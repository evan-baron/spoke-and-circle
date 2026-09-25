import { NextResponse } from 'next/server';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { createTeamSchema } from '@/lib/validation';
import { approvePendingTeam } from '@/services/teamAdminService';

export const POST = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const parsed = createTeamSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const approved = await approvePendingTeam(teamId, user.id, parsed.data);
		if (!approved) return json404('Pending team not found');

		return NextResponse.json({
			success: true,
			emailStatus: approved.emailStatus,
		});
	},
);
