import { Prisma } from '../../../generated/prisma/client';
import type {
	Team as GeneratedTeamRow,
	TeamMedia as TeamMediaRow,
} from '../../../generated/prisma/client';
import { mediaBaseUrl } from '../cloudinary';
import type {
	Ride,
	Team,
	TeamFormValues,
	TeamMediaItem,
} from '../types';
import type { CreateTeamInput } from '../validation';
import {
	bikeType,
	clubType,
	dropPolicy,
	eBikePolicy,
	format,
	mtbDiscipline,
	racingDiscipline,
} from '../enums';
import { stripInstagramHandle } from '../instagram';
import { timeZoneFor } from '../timeZone';

type TeamRow = Omit<GeneratedTeamRow, 'searchText'>;

export type TeamRowWithMedia = TeamRow & {
	media?: TeamMediaRow[];
};

function toMediaItems(rows: TeamMediaRow[] | undefined): TeamMediaItem[] {
	return [...(rows ?? [])]
		.sort((a, b) => a.position - b.position)
		.map((row) => ({
			publicId: row.publicId,
			width: row.width,
			height: row.height,
			url: mediaBaseUrl(row.publicId),
		}));
}

function nonEmpty<T>(items: T[] | null | undefined): T[] | undefined {
	return items && items.length > 0 ? items : undefined;
}

function cleanTags(tags: string[] | undefined): string[] {
	return [...new Set(tags ?? [])];
}

function userTags(row: TeamRow): string[] {
	const personaText = new Set(
		row.personaRestrictions
			.filter((restriction) => !PERSONA_CODE_BY_LABEL[restriction])
			.map((restriction) => restriction.toLowerCase()),
	);
	return row.tags.filter((tag) => !personaText.has(tag));
}

function deriveRide(row: TeamRow): Ride | undefined {
	if (!Array.isArray(row.rides)) return undefined;
	return (row.rides[0] as unknown as Ride | undefined) ?? undefined;
}

export function toTeam(row: TeamRowWithMedia): Team {
	return {
		id: row.id,
		name: row.name,
		type: clubType.fromDb[row.type],
		missionStatement: row.missionStatement ?? undefined,
		affiliation: row.affiliation ?? undefined,
		affiliatedId: row.affiliatedId ?? undefined,
		location: row.location,
		timeZone: timeZoneFor(row.latitude, row.longitude),
		additionalLocations: nonEmpty(row.additionalLocations),
		founded: row.founded ?? 0,
		contact: {
			phone: row.contactPhone ?? undefined,
			email: row.contactEmail ?? undefined,
		},
		primaryLanguage: row.primaryLanguage ?? undefined,
		verified: row.verified,
		lastActiveYear: row.lastActiveYear ?? 0,
		bikeTypes: row.bikeTypes.map((bt) => bikeType.fromDb[bt]),
		racingDisciplines: row.racingDisciplines.map(
			(rd) => racingDiscipline.fromDb[rd],
		),
		discipline: row.discipline ? mtbDiscipline.fromDb[row.discipline] : undefined,
		eBikePolicy: eBikePolicy.fromDb[row.eBikePolicy],
		eBikeNotes: row.eBikeNotes ?? undefined,
		format: format.fromDb[row.format],
		virtualPlatform: row.virtualPlatforms[0],
		homeBase: row.homeBase ?? undefined,
		website: row.website ?? undefined,
		social: {
			instagram: row.instagram ?? undefined,
			instagramLink: row.instagramLink ?? undefined,
			facebook: row.facebook ?? undefined,
			facebookLink: row.facebookLink ?? undefined,
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
		media: row.media ? toMediaItems(row.media) : undefined,
		ride: deriveRide(row),
		scheduleNotes: row.scheduleNotes ?? undefined,
		additionalRideDetails: row.additionalRideDetails ?? undefined,
		additionalRequirements: row.additionalRequirements ?? undefined,
		routeLink: row.routeLink ?? undefined,
		pace: row.pace ?? 'Relaxed',
		segmentation: row.segmentation ?? undefined,
		typicalDistanceMiles: row.typicalDistanceMiles ?? 0,
		typicalElevationGainFt: row.typicalElevationGainFt ?? 0,
		dropPolicy: row.dropPolicy ? dropPolicy.fromDb[row.dropPolicy] : 'No-drop',
		competitiveOrCasual: row.competitiveOrCasual,
		skillLevels: row.skillLevels,
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

export function toTeamCreateInput(
	input: CreateTeamInput,
	submittedById?: string,
): Prisma.TeamCreateInput {
	return {
		status: 'Pending',
		submittedBy: submittedById ? { connect: { id: submittedById } } : undefined,
		name: input.name,
		type: clubType.toDb[input.type],
		missionStatement: input.missionStatement,
		affiliation: input.affiliation,
		affiliatedTeam: input.affiliatedId ?
			{ connect: { id: input.affiliatedId } }
		:	undefined,
		location: input.location,
		additionalLocations: input.additionalLocations ?? [],
		founded: input.founded,
		primaryLanguage: input.primaryLanguage,
		contactPhone: input.contactPhone,
		contactEmail: input.contactEmail,
		bikeTypes: input.bikeTypes.map((bt) => bikeType.toDb[bt]),
		racingDisciplines:
			input.type === 'Team' ?
				(input.racingDisciplines ?? []).map((rd) => racingDiscipline.toDb[rd])
			:	[],
		discipline: input.discipline ? mtbDiscipline.toDb[input.discipline] : undefined,
		eBikePolicy: input.eBikePolicy ? eBikePolicy.toDb[input.eBikePolicy] : undefined,
		eBikeNotes:
			input.eBikePolicy === undefined ? undefined
			: input.eBikePolicy === 'Sometimes' ? (input.eBikeNotes ?? null)
			: null,
		format: format.toDb[input.format],
		virtualPlatforms: input.virtualPlatforms ?? [],
		homeBase: input.homeBase,
		website: input.website,
		instagram: input.instagram,
		instagramLink: input.instagramLink,
		facebook: input.facebook,
		facebookLink: input.facebookLink,
		strava: input.strava,
		discord: input.discord,
		ageMin: input.ageMin,
		ageMax: input.ageMax,
		personaRestrictions: input.personaRestrictions ?? [],
		memberCount: input.memberCount,
		memberLimit: input.memberLimit,
		waitlist: input.waitlist,
		howToJoin: input.howToJoin,
		rides: (input.ride ? [input.ride] : []) as unknown as Prisma.InputJsonValue,
		scheduleNotes: input.scheduleNotes,
		additionalRideDetails:
			input.type === 'Group Ride' ? input.additionalRideDetails : undefined,
		additionalRequirements:
			input.type === 'Group Ride' ? undefined : input.additionalRequirements,
		routeLink: input.type === 'Group Ride' ? input.routeLink : undefined,
		pace: input.pace,
		segmentation: input.type === 'Group Ride' ? input.segmentation : undefined,
		typicalDistanceMiles: input.typicalDistanceMiles,
		typicalElevationGainFt: input.typicalElevationGainFt,
		dropPolicy: input.dropPolicy ? dropPolicy.toDb[input.dropPolicy] : undefined,
		competitiveOrCasual:
			input.type === 'Group Ride' ?
				'Recreational'
			:	(input.competitiveOrCasual ?? 'Recreational'),
		skillLevels: input.skillLevels,
		instructional: input.instructional,
		duesRequired: input.duesRequired,
		duesAmount: input.duesAmount,
		duesSchedule: input.duesSchedule,
		requiredRides: input.requiredRides,
		requiredRaces: input.requiredRaces,
		mileageMin: input.mileageMin,
		mileageFrequency: input.mileageFrequency,
		requiredKit: input.requiredKit,
		sponsors: input.sponsors ?? [],
		eventTypes: input.eventTypes ?? [],
		joinTryouts: input.joinTryouts,
		joinReferral: input.joinReferral,
		joinInviteOnly: input.joinInviteOnly,
		joinOpen: input.joinOpen,
		tags: cleanTags(input.tags),
	};
}

const PERSONA_CODE_BY_LABEL: Record<string, string> = {
	'Women Only': 'womenOnly',
	'Men Only': 'menOnly',
	'LGBTQ+ Only': 'lgbtOnly',
	BIPOC: 'bipoc',
};

export function toTeamFormValues(row: TeamRowWithMedia): TeamFormValues {
	const persona = row.personaRestrictions[0];
	const personaCode =
		persona ? (PERSONA_CODE_BY_LABEL[persona] ?? 'other') : null;

	return {
		name: row.name,
		type: clubType.fromDb[row.type],
		missionStatement: row.missionStatement ?? '',
		affiliation: row.affiliation ?? '',
		affiliatedId: row.affiliatedId ?? '',
		location: row.location,
		additionalLocations: row.additionalLocations,
		founded: row.founded?.toString() ?? '',
		primaryLanguage: row.primaryLanguage ?? '',
		contactPhone: row.contactPhone ?? '',
		contactEmail: row.contactEmail ?? '',
		bikeTypes: row.bikeTypes.map((bt) => bikeType.fromDb[bt]),
		racingDisciplines: row.racingDisciplines.map(
			(rd) => racingDiscipline.fromDb[rd],
		),
		tags: userTags(row),
		format: format.fromDb[row.format],
		virtualPlatform: row.virtualPlatforms,
		homeBase: row.homeBase ?? '',
		website: row.website ?? '',
		instagram: stripInstagramHandle(row.instagram ?? ''),
		instagramLink: row.instagramLink ?? '',
		facebook: row.facebook ?? '',
		facebookLink: row.facebookLink ?? '',
		strava: row.strava ?? '',
		discord: row.discord ?? '',
		ageMin: row.ageMin?.toString() ?? '',
		ageMax: row.ageMax?.toString() ?? '',
		memberCount: row.memberCount.toString(),
		memberLimit: row.memberLimit?.toString() ?? '',
		howToJoin: row.howToJoin ?? '',
		personaRestriction: personaCode,
		personaOtherDescription: personaCode === 'other' ? (persona ?? '') : '',
		eBikePolicy: eBikePolicy.fromDb[row.eBikePolicy],
		eBikeNotes: row.eBikeNotes ?? '',
		waitlist: row.waitlist,
		ride: deriveRide(row),
		scheduleNotes: row.scheduleNotes ?? '',
		additionalRideDetails: row.additionalRideDetails ?? '',
		additionalRequirements: row.additionalRequirements ?? '',
		routeLink: row.routeLink ?? '',
		segmentation: row.segmentation ?? '',
		pace: row.pace ?? 'Steady',
		typicalDistanceMiles: row.typicalDistanceMiles?.toString() ?? '',
		typicalElevationGainFt: row.typicalElevationGainFt?.toString() ?? '',
		dropPolicy: row.dropPolicy ? dropPolicy.fromDb[row.dropPolicy] : 'No-drop',
		competitiveOrCasual: row.competitiveOrCasual,
		skillLevels: row.skillLevels,
		duesAmount: row.duesAmount ?? '',
		duesSchedule: row.duesSchedule ?? '',
		requiredRaces: row.requiredRaces?.toString() ?? '',
		mileageMin: row.mileageMin?.toString() ?? '',
		mileageFrequency: row.mileageFrequency ?? 'Monthly',
		sponsors: row.sponsors.join(', '),
		instructional: row.instructional,
		duesRequired: row.duesRequired,
		requiredRides: row.requiredRides,
		requiredKit: row.requiredKit,
		eventSponsor: row.eventTypes.includes('Sponsor Events'),
		eventTeamSpecific: row.eventTypes.includes('Team-specific Events'),
		eventPublic: row.eventTypes.includes('Public Events'),
		eventRecruiting: row.eventTypes.includes('Recruiting Events'),
		joinTryouts: row.joinTryouts,
		joinReferral: row.joinReferral,
		joinInviteOnly: row.joinInviteOnly,
		joinOpen: row.joinOpen,
		media: toMediaItems(row.media),
	};
}

export function toGroupRideFormValues(row: TeamRow): TeamFormValues {
	return {
		...toTeamFormValues(row),
		media: [],
		type: 'Group Ride',
		tags: [],
		name: '',
		affiliation: row.name,
		affiliatedId: row.id,
		missionStatement: '',
		location: '',
		additionalLocations: [],
		bikeTypes: [],
		format: 'In-person',
		virtualPlatform: [],
		howToJoin: '',
		joinTryouts: false,
		joinReferral: false,
		joinInviteOnly: false,
		joinOpen: false,
		founded: '',
		ride: undefined,
		scheduleNotes: '',
		additionalRideDetails: '',
		additionalRequirements: '',
		routeLink: '',
		segmentation: '',
		pace: 'Relaxed',
		typicalDistanceMiles: '',
		typicalElevationGainFt: '',
	};
}

export function toApprovedTeamUpdate(
	input: CreateTeamInput,
): Prisma.TeamUncheckedUpdateManyInput {
	return {
		status: 'Approved',
		name: input.name,
		type: clubType.toDb[input.type],
		missionStatement: input.missionStatement ?? null,
		affiliation: input.affiliation ?? null,
		affiliatedId: input.affiliatedId ?? null,
		location: input.location,
		additionalLocations: input.additionalLocations ?? [],
		founded: input.founded ?? null,
		primaryLanguage: input.primaryLanguage ?? null,
		contactPhone: input.contactPhone ?? null,
		contactEmail: input.contactEmail ?? null,
		bikeTypes: input.bikeTypes.map((bt) => bikeType.toDb[bt]),
		racingDisciplines:
			input.type === 'Team' ?
				(input.racingDisciplines ?? []).map((rd) => racingDiscipline.toDb[rd])
			:	[],
		eBikePolicy: input.eBikePolicy ? eBikePolicy.toDb[input.eBikePolicy] : 'No',
		eBikeNotes:
			input.eBikePolicy === 'Sometimes' ? (input.eBikeNotes ?? null) : null,
		format: format.toDb[input.format],
		virtualPlatforms: input.virtualPlatforms ?? [],
		homeBase: input.homeBase ?? null,
		website: input.website ?? null,
		instagram: input.instagram ?? null,
		instagramLink: input.instagramLink ?? null,
		facebook: input.facebook ?? null,
		facebookLink: input.facebookLink ?? null,
		strava: input.strava ?? null,
		discord: input.discord ?? null,
		ageMin: input.ageMin ?? null,
		ageMax: input.ageMax ?? null,
		personaRestrictions: input.personaRestrictions ?? [],
		memberCount: input.memberCount ?? 0,
		memberLimit: input.memberLimit ?? null,
		waitlist: input.waitlist ?? false,
		howToJoin: input.howToJoin ?? null,
		rides: (input.ride ? [input.ride] : []) as unknown as Prisma.InputJsonValue,
		scheduleNotes: input.scheduleNotes ?? null,
		additionalRideDetails:
			input.type === 'Group Ride' ? (input.additionalRideDetails ?? null) : null,
		additionalRequirements:
			input.type === 'Group Ride' ? null : (input.additionalRequirements ?? null),
		routeLink: input.type === 'Group Ride' ? (input.routeLink ?? null) : null,
		segmentation: input.type === 'Group Ride' ? (input.segmentation ?? null) : null,
		pace: input.pace ?? null,
		typicalDistanceMiles: input.typicalDistanceMiles ?? null,
		typicalElevationGainFt: input.typicalElevationGainFt ?? null,
		dropPolicy: input.dropPolicy ? dropPolicy.toDb[input.dropPolicy] : null,
		competitiveOrCasual:
			input.type === 'Group Ride' ?
				'Recreational'
			:	(input.competitiveOrCasual ?? 'Recreational'),
		skillLevels: input.skillLevels,
		instructional: input.instructional ?? false,
		duesRequired: input.duesRequired ?? false,
		duesAmount: input.duesAmount ?? null,
		duesSchedule: input.duesSchedule ?? null,
		requiredRides: input.requiredRides ?? false,
		requiredRaces: input.requiredRaces ?? null,
		mileageMin: input.mileageMin ?? null,
		mileageFrequency: input.mileageFrequency ?? null,
		requiredKit: input.requiredKit ?? false,
		sponsors: input.sponsors ?? [],
		eventTypes: input.eventTypes ?? [],
		joinTryouts: input.joinTryouts ?? false,
		joinReferral: input.joinReferral ?? false,
		joinInviteOnly: input.joinInviteOnly ?? false,
		joinOpen: input.joinOpen ?? false,
		tags: cleanTags(input.tags),
	};
}
