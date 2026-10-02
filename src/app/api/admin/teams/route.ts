import { NextResponse } from 'next/server';
import { jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { deleteTeamsSchema } from '@/lib/validation';
import { deleteApprovedTeams } from '@/services/teamAdminService';

export const DELETE = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request) => {
		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const parsed = deleteTeamsSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const deleted = await deleteApprovedTeams(parsed.data.ids);

		return NextResponse.json({ success: true, deleted });
	},
);
