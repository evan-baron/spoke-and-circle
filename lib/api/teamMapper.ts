import type { Team as TeamRow } from '../../generated/prisma/client';
import {
	bikeTypeFromDb,
	clubTypeFromDb,
	disciplineFromDb,
	dropPolicyFromDb,
	formatFromDb,
	rankingSystemFromDb,
	segmentationFromDb,
} from '../teamEnums';
import type { Team } from '../types';

function nonEmpty<T>(items: T[]): T[] | undefined {
	return items.length > 0 ? items : undefined;
}

export function toTeam(row: TeamRow): Team {
	return {
		id: row.slug,
		name: row.name,
		type: clubTypeFromDb[row.type],
		missionStatement: row.missionStatement ?? undefined,
		codeOfConduct: row.codeOfConduct ?? undefined,
		affiliation: row.affiliation ?? undefined,
		location: row.location,
		additionalLocations: nonEmpty(row.additionalLocations),
		founded: row.founded ?? 0,
		visibility: row.visibility,
		contact: {
			phone: row.contactPhone ?? undefined,
			email: row.contactEmail ?? undefined,
		},
		primaryLanguage: row.primaryLanguage ?? undefined,
		verified: row.verified,
		lastActiveYear: row.lastActiveYear ?? 0,
		bikeType: bikeTypeFromDb[row.bikeType],
		discipline: row.discipline ? disciplineFromDb[row.discipline] : undefined,
		eBikeAllowed: row.eBikeAllowed,
		format: formatFromDb[row.format],
		virtualPlatform: row.virtualPlatforms[0],
		homeBaseAffiliation: row.homeBaseAffiliation ?? undefined,
		website: row.website ?? undefined,
		social: {
			instagram: row.instagram ?? undefined,
			facebook: row.facebook ?? undefined,
			strava: row.strava ?? undefined,
			discord: row.discord ?? undefined,
		},
		ageRequirement:
			row.ageMin !== null || row.ageMax !== null ?
				{ min: row.ageMin ?? undefined, max: row.ageMax ?? undefined }
			:	undefined,
		personaRestrictions: nonEmpty(row.personaRestrictions),
		memberCount: row.memberCount,
		memberLimit: row.memberLimit ?? undefined,
		waitlist: row.waitlist,
		howToJoin: row.howToJoin ?? '',
		rideSchedule: row.rideSchedule ?? 'Weekly',
		startTimes: nonEmpty(row.startTimes),
		pace: row.pace ?? 'Casual',
		segmentation: row.segmentation ? segmentationFromDb[row.segmentation] : 'N/A',
		typicalDistanceMiles: row.typicalDistanceMiles ?? 0,
		typicalElevationGainFt: row.typicalElevationGainFt ?? 0,
		dropPolicy: row.dropPolicy ? dropPolicyFromDb[row.dropPolicy] : 'No-drop',
		rideVisibility: row.rideVisibility,
		competitiveOrCasual: row.competitiveOrCasual,
		skillLevel: row.skillLevel,
		instructional: row.instructional,
		duesRequired: row.duesRequired,
		duesAmount: row.duesAmount ?? undefined,
		duesSchedule: row.duesSchedule ?? undefined,
		requiredRides: row.requiredRides,
		requiredRaces: row.requiredRaces ?? undefined,
		mileageRequirement:
			row.mileageMin !== null && row.mileageFrequency !== null ?
				{ min: row.mileageMin, frequency: row.mileageFrequency }
			:	undefined,
		requiredKit: row.requiredKit,
		rankingSystem: rankingSystemFromDb[row.rankingSystem],
		hasRoster: row.hasRoster,
		sponsors: nonEmpty(row.sponsors),
		eventTypes: nonEmpty(row.eventTypes),
		joinRequirements: {
			tryouts: row.joinTryouts,
			referralRequired: row.joinReferral,
			inviteOnly: row.joinInviteOnly,
			open: row.joinOpen,
		},
		tags: row.tags,
	};
}
