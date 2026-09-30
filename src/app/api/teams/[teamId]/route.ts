import { NextResponse } from 'next/server';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { createTeamSchema } from '@/lib/validation';
import {
	describeUnknownLocations,
	findUnknownLocations,
} from '@/services/placeService';
import { updateApprovedTeam } from '@/services/teamAdminService';

export const PUT = withAuth(
	{ rateLimit: 'teams-write' },
	async (request, user, params) => {
		const teamId = typeof params?.teamId === 'string' ? params.teamId : '';
		if (!teamId) return json400('Invalid team id');

		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const { verified: _verified, ...teamFields } = result.body;
		const parsed = createTeamSchema.safeParse(teamFields);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const unknownLocations = await findUnknownLocations(
			parsed.data.location,
			parsed.data.additionalLocations ?? [],
		);
		const unknownLocationsMessage = describeUnknownLocations(unknownLocations);
		if (unknownLocationsMessage) return json400(unknownLocationsMessage);

		const updated = await updateApprovedTeam(teamId, parsed.data, {
			ownerId: user.id,
		});
		if (!updated) return json404('Team not found');

		return NextResponse.json({ success: true });
	},
);
