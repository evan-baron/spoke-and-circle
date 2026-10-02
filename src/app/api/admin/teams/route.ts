import { NextResponse } from 'next/server';
import { jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { fromQueryString, parseSearchParams } from '@/lib/searchParams';
import { deleteTeamsSchema } from '@/lib/validation';
import { deleteApprovedTeams } from '@/services/teamAdminService';
import { searchApprovedTeams } from '@/services/teamSearchService';

export const GET = withAuth(
	{ rateLimit: 'teams-read', role: 'admin' },
	async (request) => {
		const { page: requestedPage, ...params } = parseSearchParams(
			fromQueryString(request.nextUrl.searchParams),
		);
		const result = await searchApprovedTeams(params, requestedPage);

		return NextResponse.json({ success: true, ...result });
	},
);

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
