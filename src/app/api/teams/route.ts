import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
	json400,
	json401,
	json500,
	jsonValidationError,
	withPublicRateLimit,
} from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { toTeamCreateInput } from '@/lib/api/teamMapper';
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
import { revalidateDuplicateCandidates, revalidateTeams } from '@/lib/teamCache';
import { syncAdditionalPlaces } from '@/services/teamLocationService';
import { prepareTeamMedia, saveTeamMedia } from '@/services/teamMediaService';

async function getSubmitter(): Promise<
	{ id: string; isAdmin: boolean } | undefined
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
		return json400(
			'Please answer the math question correctly and try again.',
		);
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

	const submitter = await getSubmitter();

	if (parsed.data.type === 'Group Ride') {
		if (!submitter) return json401('Sign in to submit a group ride.');
		if (!parsed.data.ride?.startTime) {
			return json400('Start time is required for a group ride.');
		}
		if (!parsed.data.affiliatedId && !parsed.data.contactEmail) {
			return json400('Contact email is required for a standalone group ride.');
		}
	}

	try {
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

		if (published) revalidateTeams(team.id);
		else revalidateDuplicateCandidates();

		return NextResponse.json(
			{ success: true, published, team: { id: team.id } },
			{ status: 201 },
		);
	} catch (error) {
		console.error('Error creating team:', error);
		return json500('We could not submit your team. Please try again.');
	}
}, { adminRateLimit: true });
