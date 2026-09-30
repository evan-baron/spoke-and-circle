import { NextResponse } from 'next/server';
import { z } from 'zod';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { transferTeamOwnership } from '@/services/teamAdminService';

const transferSchema = z.object({
	userId: z.number().int().positive(),
});

export const PUT = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, admin, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const parsed = transferSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const transfer = await transferTeamOwnership(
			teamId,
			parsed.data.userId,
			admin.id,
		);

		switch (transfer.status) {
			case 'team_not_found':
				return json404('Team not found');
			case 'user_not_found':
				return json404('User not found');
			case 'already_owner':
				return json400('That user already owns this team');
			case 'transferred':
				return NextResponse.json({
					success: true,
					emailStatus: transfer.emailStatus,
				});
		}
	},
);
