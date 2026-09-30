import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
	json400,
	json500,
	jsonValidationError,
	withPublicRateLimit,
} from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { toTeam, toTeamCreateInput } from '@/lib/api/teamMapper';
import { isAntiBotAnswerCorrect } from '@/lib/data/mathQuestions';
import { antiBotSchema, createTeamSchema } from '@/lib/validation';
import { getApiUser } from '@/services/getUserService';
import {
	describeUnknownLocations,
	findUnknownLocations,
	resolveCoordinates,
} from '@/services/placeService';
import { syncAdditionalPlaces } from '@/services/teamLocationService';

export const GET = withPublicRateLimit('teams-read', async () => {
	try {
		const teams = await prisma.team.findMany({
			where: { status: 'Approved' },
			orderBy: { name: 'asc' },
		});

		return NextResponse.json({ success: true, teams: teams.map(toTeam) });
	} catch (error) {
		console.error('Error fetching teams:', error);
		return json500('Failed to fetch teams');
	}
});

async function getSubmitter(): Promise<
	{ id: number; isAdmin: boolean } | undefined
> {
	try {
		const { user } = await getApiUser();
		if (!user?.active) return undefined;
		return { id: user.id, isAdmin: user.role === 'admin' };
	} catch {
		return undefined;
	}
}

export const POST = withPublicRateLimit('teams-write', async (request) => {
	const result = await readJsonObject(request);
	if ('error' in result) return result.error;

	const { antibot, antibotIndex, ...teamFields } = result.body;

	const antiBot = antiBotSchema.safeParse({ antibot, antibotIndex });
	if (
		!antiBot.success ||
		!isAntiBotAnswerCorrect(antiBot.data.antibotIndex, antiBot.data.antibot)
	) {
		return json400('Failed anti-bot check');
	}

	const parsed = createTeamSchema.safeParse(teamFields);
	if (!parsed.success) return jsonValidationError(parsed.error);

	const unknownLocations = await findUnknownLocations(
		parsed.data.location,
		parsed.data.additionalLocations ?? [],
	);
	const unknownLocationsMessage = describeUnknownLocations(unknownLocations);
	if (unknownLocationsMessage) return json400(unknownLocationsMessage);

	try {
		const submitter = await getSubmitter();
		const published = submitter?.isAdmin === true;

		const team = await prisma.team.create({
			data: {
				...toTeamCreateInput(parsed.data, submitter?.id),
				...(published ?
					{
						status: 'Approved' as const,
						verified: true,
						lastActiveYear: new Date().getFullYear(),
					}
				:	{}),
				...(await resolveCoordinates(parsed.data.location)),
			},
			select: { id: true },
		});

		try {
			await syncAdditionalPlaces(team.id, parsed.data.additionalLocations ?? []);
		} catch (error) {
			console.error('Error saving additional locations:', error);
		}

		return NextResponse.json(
			{ success: true, published, team: { id: team.id } },
			{ status: 201 },
		);
	} catch (error) {
		console.error('Error creating team:', error);
		return json500('Failed to submit team');
	}
});
