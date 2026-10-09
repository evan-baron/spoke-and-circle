import type { buildTeamPayload } from './teamForm';
import type { Team, TeamMediaItem } from './types';

type TeamPayload = ReturnType<typeof buildTeamPayload>;

interface PreviewOptions {
	media: TeamMediaItem[];
	namePrefix?: string;
}

export function payloadToTeam(
	payload: TeamPayload,
	{ media, namePrefix }: PreviewOptions,
): Team {
	const name = payload.name ?? '';
	const hasAge = payload.ageMin !== undefined || payload.ageMax !== undefined;

	return {
		id: 'preview',
		name: namePrefix ? `${namePrefix} - ${name}` : name,
		type: (payload.type ?? 'Club') as Team['type'],
		missionStatement: payload.missionStatement,
		codeOfConduct: payload.codeOfConduct,
		affiliation: payload.affiliation,
		affiliatedId: payload.affiliatedId,
		location: payload.location ?? '',
		additionalLocations: payload.additionalLocations,
		founded: payload.founded ?? 0,
		contact: { phone: payload.contactPhone, email: payload.contactEmail },
		primaryLanguage: payload.primaryLanguage,
		verified: false,
		lastActiveYear: 0,
		bikeTypes: payload.bikeTypes as Team['bikeTypes'],
		racingDisciplines: payload.racingDisciplines as Team['racingDisciplines'],
		eBikeAllowed: payload.eBikeAllowed,
		format: (payload.format ?? 'In-person') as Team['format'],
		virtualPlatform: payload.virtualPlatforms?.[0] as Team['virtualPlatform'],
		homeBase: payload.homeBase,
		website: payload.website,
		social: {
			instagram: payload.instagram,
			instagramLink: payload.instagramLink,
			facebook: payload.facebook,
			facebookLink: payload.facebookLink,
			strava: payload.strava,
			discord: payload.discord,
		},
		ageRequirement:
			hasAge ? { min: payload.ageMin, max: payload.ageMax } : undefined,
		personaRestrictions: payload.personaRestrictions,
		memberCount: payload.memberCount ?? 0,
		memberLimit: payload.memberLimit,
		waitlist: payload.waitlist,
		howToJoin: payload.howToJoin ?? '',
		media,
		rideSchedule: 'Weekly',
		rides: payload.rides ?? [],
		scheduleNotes: payload.scheduleNotes,
		additionalRideDetails: payload.additionalRideDetails,
		pace: (payload.pace ?? 'Relaxed') as Team['pace'],
		segmentation: 'N/A',
		typicalDistanceMiles: payload.typicalDistanceMiles ?? 0,
		typicalElevationGainFt: payload.typicalElevationGainFt ?? 0,
		dropPolicy: (payload.dropPolicy ?? 'No-drop') as Team['dropPolicy'],
		competitiveOrCasual: (payload.competitiveOrCasual ??
			'Recreational') as Team['competitiveOrCasual'],
		skillLevels: payload.skillLevels as Team['skillLevels'],
		instructional: payload.instructional,
		duesRequired: payload.duesRequired,
		duesAmount: payload.duesAmount,
		duesSchedule: payload.duesSchedule as Team['duesSchedule'],
		requiredRides: payload.requiredRides,
		requiredRaces: payload.requiredRaces,
		mileageRequirement:
			payload.mileageMin !== undefined && payload.mileageFrequency ?
				{
					min: payload.mileageMin,
					frequency:
						payload.mileageFrequency as NonNullable<
							Team['mileageRequirement']
						>['frequency'],
				}
			:	undefined,
		requiredKit: payload.requiredKit,
		sponsors: payload.sponsors,
		eventTypes: payload.eventTypes,
		joinRequirements: {
			tryouts: payload.joinTryouts,
			referralRequired: payload.joinReferral,
			inviteOnly: payload.joinInviteOnly,
			open: payload.joinOpen,
		},
		tags: payload.tags,
	};
}
