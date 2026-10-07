import { z } from 'zod';
import * as enums from '@/lib/enums';
import { stripInstagramHandle } from '@/lib/instagram';
import mathQuestions from '@/lib/data/mathQuestions';
import { MAX_TEAM_MEDIA, MEDIA_PUBLIC_ID_PATTERN } from '@/lib/media';

const clubTypeSchema = z.enum(enums.clubType.labels);
const bikeTypeSchema = z.enum(enums.bikeType.labels);
const racingDisciplineSchema = z.enum(enums.racingDiscipline.labels);
const formatSchema = z.enum(enums.format.labels);
const virtualPlatformSchema = z.enum(enums.virtualPlatform.labels);
const paceSchema = z.enum(enums.pace.labels);
const skillLevelSchema = z.enum(enums.skillLevel.labels);
const mtbDisciplineSchema = z.enum(enums.mtbDiscipline.labels);
const segmentationSchema = z.enum(enums.segmentation.labels);
const scheduleFrequencySchema = z.enum(enums.scheduleFrequency.labels);
const dropPolicySchema = z.enum(enums.dropPolicy.labels);
const competitiveOrCasualSchema = z.enum(enums.competitiveOrCasual.labels);
const dayOfWeekSchema = z.enum(enums.dayOfWeek.labels);
const rideOrdinalSchema = z.enum(enums.rideOrdinal.labels);
const rideMonthSchema = z.number().int().min(1).max(12);
const rideSchema = z
	.object({
		pattern: z.enum(['weekly', 'biweekly', 'monthly']),
		days: z
			.array(dayOfWeekSchema)
			.min(1, 'Choose at least one day for the ride')
			.max(7),
		ordinals: z.array(rideOrdinalSchema).max(5).optional(),
		startDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid first ride date')
			.refine((value) => !Number.isNaN(Date.parse(value)), {
				message: 'Enter a valid first ride date',
			})
			.optional(),
		startTime: z
			.string()
			.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid start time')
			.optional(),
		monthFrom: rideMonthSchema.optional(),
		monthTo: rideMonthSchema.optional(),
		details: z
			.string()
			.trim()
			.max(300, 'Ride details must be less than 300 characters')
			.optional(),
	})
	.superRefine((ride, ctx) => {
		if (ride.pattern === 'monthly' && !ride.ordinals?.length) {
			ctx.addIssue({
				code: 'custom',
				path: ['ordinals'],
				message: 'Choose which weeks of the month each monthly ride happens',
			});
		}
		if (ride.pattern === 'biweekly' && !ride.startDate) {
			ctx.addIssue({
				code: 'custom',
				path: ['startDate'],
				message: 'Enter a first ride date for every-other-week rides',
			});
		}
		if ((ride.monthFrom === undefined) !== (ride.monthTo === undefined)) {
			ctx.addIssue({
				code: 'custom',
				path: ['monthFrom'],
				message: 'Choose both a first and last month',
			});
		}
	});

const eventTypeSchema = z.enum(enums.eventType.labels);

const teamListItemSchema = z
	.string()
	.trim()
	.min(1, 'List items cannot be empty')
	.max(100, 'List items must be less than 100 characters');

const teamBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(200, 'Name must be less than 200 characters'),
	type: clubTypeSchema,
	missionStatement: z
		.string()
		.trim()
		.max(1000, 'Mission statement must be less than 1000 characters')
		.optional(),
	codeOfConduct: z
		.string()
		.trim()
		.max(2000, 'Code of conduct must be less than 2000 characters')
		.optional(),
	affiliation: z
		.string()
		.trim()
		.max(200, 'Affiliation must be less than 200 characters')
		.optional(),
	affiliatedId: z.string().trim().min(1).optional(),
	location: z
		.string()
		.trim()
		.min(1, 'Location is required')
		.max(200, 'Location must be less than 200 characters'),
	additionalLocations: z
		.array(
			z
				.string()
				.trim()
				.min(1, 'Location cannot be empty')
				.max(200, 'Location must be less than 200 characters'),
		)
		.max(10, 'No more than 10 additional locations')
		.optional(),
	founded: z
		.number()
		.int('Founded must be a whole year')
		.min(1970, 'Founded year must be 1970 or later')
		.max(new Date().getFullYear(), 'Founded year cannot be in the future')
		.optional(),
	primaryLanguage: z
		.string()
		.trim()
		.max(100, 'Primary language must be less than 100 characters')
		.optional(),
	contactPhone: z
		.string()
		.trim()
		.max(30, 'Phone number must be less than 30 characters')
		.optional(),
	contactEmail: z.email('Invalid contact email address').optional(),

	bikeTypes: z
		.array(bikeTypeSchema)
		.min(1, 'Choose at least one cycling discipline'),
	discipline: mtbDisciplineSchema.optional(),
	racingDisciplines: z.array(racingDisciplineSchema).max(21).optional(),
	tags: z
		.array(
			z
				.string()
				.trim()
				.toLowerCase()
				.min(1, 'Tags cannot be empty')
				.max(40, 'Tags must be 40 characters or fewer'),
		)
		.max(10, 'Add up to 10 tags')
		.optional(),
	eBikeAllowed: z.boolean().optional(),
	format: formatSchema,
	virtualPlatforms: z.array(virtualPlatformSchema).max(4).optional(),
	homeBase: z
		.string()
		.trim()
		.max(200, 'Home base must be less than 200 characters')
		.optional(),
	website: z
		.url({ protocol: /^https?$/, message: 'Invalid website URL' })
		.max(300, 'Website must be less than 300 characters')
		.optional(),
	instagram: z
		.string()
		.transform(stripInstagramHandle)
		.pipe(z.string().max(100))
		.optional(),
	instagramLink: z
		.url({ protocol: /^https?$/, message: 'Invalid Instagram URL' })
		.max(300, 'Instagram link must be less than 300 characters')
		.optional(),
	facebook: z.string().trim().max(100).optional(),
	facebookLink: z
		.url({ protocol: /^https?$/, message: 'Invalid Facebook URL' })
		.max(300, 'Facebook link must be less than 300 characters')
		.optional(),
	strava: z.string().trim().max(100).optional(),
	discord: z.string().trim().max(100).optional(),
	ageMin: z
		.number()
		.int('Minimum age must be a whole number')
		.min(0, 'Minimum age cannot be negative')
		.max(120, 'Minimum age must be 120 or less')
		.optional(),
	ageMax: z
		.number()
		.int('Maximum age must be a whole number')
		.min(0, 'Maximum age cannot be negative')
		.max(120, 'Maximum age must be 120 or less')
		.optional(),
	personaRestrictions: z.array(teamListItemSchema).max(10).optional(),
	memberCount: z
		.number()
		.int('Member count must be a whole number')
		.min(0, 'Member count cannot be negative')
		.max(1000000, 'Member count is too large')
		.optional(),
	memberLimit: z
		.number()
		.int('Member limit must be a whole number')
		.min(0, 'Member limit cannot be negative')
		.max(1000000, 'Member limit is too large')
		.optional(),
	waitlist: z.boolean().optional(),
	howToJoin: z
		.string()
		.trim()
		.max(1000, 'How to join must be less than 1000 characters')
		.optional(),

	rides: z
		.array(rideSchema)
		.max(1, 'A ride has one schedule. Submit another ride as its own listing')
		.optional(),
	scheduleNotes: z
		.string()
		.trim()
		.max(500, 'Schedule notes must be less than 500 characters')
		.optional(),
	additionalRideDetails: z
		.string()
		.transform((value) => value.replace(/\r\n?/g, '\n').trim())
		.pipe(
			z
				.string()
				.max(1000, 'Additional ride details must be 1,000 characters or fewer'),
		)
		.optional(),
	pace: paceSchema.optional(),
	segmentation: segmentationSchema.optional(),
	typicalDistanceMiles: z
		.number()
		.int('Distance must be a whole number')
		.min(0, 'Distance cannot be negative')
		.max(1000, 'Distance is too large')
		.optional(),
	typicalElevationGainFt: z
		.number()
		.int('Elevation gain must be a whole number')
		.min(0, 'Elevation gain cannot be negative')
		.max(100000, 'Elevation gain is too large')
		.optional(),
	dropPolicy: dropPolicySchema.optional(),

	competitiveOrCasual: competitiveOrCasualSchema.optional(),
	skillLevels: z
		.array(skillLevelSchema)
		.min(1, 'Choose at least one skill level')
		.max(enums.skillLevel.labels.length),
	instructional: z.boolean().optional(),
	duesRequired: z.boolean().optional(),
	duesAmount: z
		.string()
		.trim()
		.max(100, 'Dues amount must be less than 100 characters')
		.optional(),
	duesSchedule: scheduleFrequencySchema.optional(),
	requiredRides: z.boolean().optional(),
	requiredRaces: z
		.number()
		.int('Required races must be a whole number')
		.min(0, 'Required races cannot be negative')
		.max(1000, 'Required races is too large')
		.optional(),
	mileageMin: z
		.number()
		.int('Mileage must be a whole number')
		.min(0, 'Mileage cannot be negative')
		.max(100000, 'Mileage is too large')
		.optional(),
	mileageFrequency: scheduleFrequencySchema.optional(),
	requiredKit: z.boolean().optional(),
	sponsors: z.array(teamListItemSchema).max(20).optional(),
	eventTypes: z.array(eventTypeSchema).max(4).optional(),
	joinTryouts: z.boolean().optional(),
	joinReferral: z.boolean().optional(),
	joinInviteOnly: z.boolean().optional(),
	joinOpen: z.boolean().optional(),
	media: z
		.array(z.object({ publicId: z.string().regex(MEDIA_PUBLIC_ID_PATTERN) }))
		.max(MAX_TEAM_MEDIA)
		.optional(),
});

type TeamFields = z.infer<typeof teamBaseSchema>;

const ageRangeCheck = (team: Partial<TeamFields>) =>
	team.ageMin === undefined ||
	team.ageMax === undefined ||
	team.ageMin <= team.ageMax;

const mileageCheck = (team: Partial<TeamFields>) =>
	(team.mileageMin === undefined) === (team.mileageFrequency === undefined);

const competitiveOrCasualCheck = (team: Partial<TeamFields>) =>
	team.type === 'Group Ride' || team.competitiveOrCasual !== undefined;

const ageRangeIssue = {
	message: 'Minimum age cannot be greater than maximum age',
	path: ['ageMin'],
};

const mileageIssue = {
	message: 'Mileage requirement needs both a minimum and a frequency',
	path: ['mileageMin'],
};

const competitiveOrCasualIssue = {
	message: 'Competitive or recreational is required',
	path: ['competitiveOrCasual'],
};

export const createTeamSchema = teamBaseSchema
	.refine(ageRangeCheck, ageRangeIssue)
	.refine(mileageCheck, mileageIssue)
	.refine(competitiveOrCasualCheck, competitiveOrCasualIssue);

export const updateTeamSchema = teamBaseSchema
	.partial()
	.refine(ageRangeCheck, ageRangeIssue);

export const rejectTeamSchema = z.object({
	reason: z
		.string()
		.trim()
		.max(1000, 'Rejection reason must be less than 1000 characters')
		.optional(),
});

export const deleteTeamsSchema = z.object({
	ids: z
		.array(z.string().trim().min(1))
		.min(1, 'Choose at least one team')
		.max(100, 'Delete up to 100 teams at a time'),
});

const personNameSchema = z
	.string()
	.trim()
	.max(50, 'Names must be less than 50 characters')
	.refine((value) => !/[\u0000-\u001f\u007f@<>]/.test(value), {
		message: `Names can't contain @, < or >`,
	});

export const profileNameSchema = z.object({
	firstName: personNameSchema.min(1, 'First name is required'),
	lastName: personNameSchema.optional(),
});

export const antiBotSchema = z.object({
	antibotIndex: z
		.number()
		.int('Invalid anti-bot question')
		.min(0, 'Invalid anti-bot question')
		.max(mathQuestions.length - 1, 'Invalid anti-bot question'),
	antibot: z.string().regex(/^\d$/, 'Invalid anti-bot answer'),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
