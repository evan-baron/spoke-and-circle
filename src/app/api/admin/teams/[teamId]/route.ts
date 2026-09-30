import { NextResponse } from 'next/server';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { createTeamSchema, rejectTeamSchema } from '@/lib/validation';
import { describeUnknownLocations, findUnknownLocations } from '@/services/placeService';
import {
	rejectPendingTeam,
	toggleTeamVerified,
	updateApprovedTeam,
} from '@/services/teamAdminService';

export const PUT = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, _user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const { verified, ...teamFields } = result.body;
		const parsed = createTeamSchema.safeParse(teamFields);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const unknownLocations = await findUnknownLocations(
			parsed.data.location,
			parsed.data.additionalLocations ?? [],
		);
		const unknownLocationsMessage = describeUnknownLocations(unknownLocations);
		if (unknownLocationsMessage) return json400(unknownLocationsMessage);

		const updated = await updateApprovedTeam(
			teamId,
			parsed.data,
			{ verified: typeof verified === 'boolean' ? verified : undefined },
		);
		if (!updated) return json404('Approved team not found');

		return NextResponse.json({ success: true });
	},
);

export const PATCH = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (_request, _user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const verified = await toggleTeamVerified(teamId);
		if (verified === null) return json404('Approved team not found');

		return NextResponse.json({ success: true, verified });
	},
);

export const DELETE = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request, { allowEmpty: true });
		if ('error' in result) return result.error;

		const parsed = rejectTeamSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const rejected = await rejectPendingTeam(
			teamId,
			user.id,
			parsed.data.reason || undefined,
		);
		if (!rejected) return json404('Pending team not found');

		return NextResponse.json({
			success: true,
			emailStatus: rejected.emailStatus,
		});
	},
);
