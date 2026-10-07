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
import {
	antiBotSchema,
	type CreateTeamInput,
	createTeamSchema,
} from '@/lib/validation';
import { getApiUser } from '@/services/getUserService';
import {
	describeUnknownLocations,
	findUnknownLocations,
	resolveCoordinates,
} from '@/services/placeService';
import { syncAdditionalPlaces } from '@/services/teamLocationService';
import { prepareTeamMedia, saveTeamMedia } from '@/services/teamMediaService';

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

const MAX_TEAM_NAME_LENGTH = 200;

async function resolveTeamName(
	data: CreateTeamInput,
): Promise<{ name: string } | { error: string }> {
	if (data.type !== 'Group Ride' || !data.affiliatedId) {
		return { name: data.name };
	}

	const parent = await prisma.team.findUnique({
		where: { id: data.affiliatedId },
		select: { name: true },
	});
	if (!parent) return { error: 'Affiliated team not found' };

	const prefix = `${parent.name} - `;
	const name = data.name.startsWith(prefix) ? data.name : `${prefix}${data.name}`;
	if (name.length > MAX_TEAM_NAME_LENGTH) {
		return {
			error: `Name must be less than ${MAX_TEAM_NAME_LENGTH} characters including the affiliated team's name`,
		};
	}

	return { name };
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

	const resolvedName = await resolveTeamName(parsed.data);
	if ('error' in resolvedName) return json400(resolvedName.error);

	try {
		const submitter = await getSubmitter();
		const published = submitter?.isAdmin === true;

		const preparedMedia = await prepareTeamMedia(
			null,
			parsed.data.media?.map((item) => item.publicId),
			submitter,
		);
		if ('error' in preparedMedia) return json400(preparedMedia.error);

		const team = await prisma.team.create({
			data: {
				...toTeamCreateInput(
					{ ...parsed.data, name: resolvedName.name },
					submitter?.id,
				),
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

		try {
			await saveTeamMedia(team.id, preparedMedia.rows);
		} catch (error) {
			console.error('Error saving team media:', error);
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
