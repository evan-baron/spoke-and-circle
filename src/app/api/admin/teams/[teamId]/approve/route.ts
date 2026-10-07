import { NextResponse } from 'next/server';
import { json400, json404, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { createTeamSchema } from '@/lib/validation';
import { describeUnknownLocations, findUnknownLocations } from '@/services/placeService';
import { approvePendingTeam } from '@/services/teamAdminService';
import { prepareTeamMedia, saveTeamMedia } from '@/services/teamMediaService';

export const POST = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, user, params) => {
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

		const preparedMedia = await prepareTeamMedia(
			teamId,
			parsed.data.media?.map((item) => item.publicId),
			{ id: user.id, isAdmin: true },
		);
		if ('error' in preparedMedia) return json400(preparedMedia.error);

		const approved = await approvePendingTeam(
			teamId,
			user.id,
			parsed.data,
			typeof verified === 'boolean' ? verified : undefined,
		);
		if (!approved) return json404('Pending team not found');

		try {
			await saveTeamMedia(teamId, preparedMedia.rows);
		} catch (error) {
			console.error('Error saving team media:', error);
		}

		return NextResponse.json({
			success: true,
			emailStatus: approved.emailStatus,
		});
	},
);
