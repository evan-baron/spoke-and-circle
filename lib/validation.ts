import { z } from 'zod';

const clubTypeSchema = z.enum([
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
]);
const bikeTypeSchema = z.enum([
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'Tri',
	'E-bike',
	'Mixed',
]);
const formatSchema = z.enum(['In-person', 'Virtual', 'Hybrid']);
const virtualPlatformSchema = z.enum([
	'Zwift',
	'Strava',
	'TrainerRoad',
	'Other',
]);
const paceSchema = z.enum(['Casual', 'Steady', 'Competitive']);
const skillLevelSchema = z.enum([
	'Beginner',
	'Intermediate',
	'Advanced',
	'Expert',
]);
const mtbDisciplineSchema = z.enum([
	'Cross-country',
	'Trail',
	'Enduro',
	'Downhill',
	'All-mountain',
]);
const segmentationSchema = z.enum(['A Group', 'B Group', 'C Group', 'N/A']);
const scheduleFrequencySchema = z.enum(['Weekly', 'Monthly', 'Annually']);
const dropPolicySchema = z.enum(['Drop', 'No-drop']);
const rankingSystemSchema = z.enum([
	'Captains',
	'Ride Leaders',
	'Liaison',
	'N/A',
]);
const visibilitySchema = z.enum(['Public', 'Private']);
const competitiveOrCasualSchema = z.enum(['Competitive', 'Casual']);

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
		.max(100, 'Name must be less than 100 characters'),
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
	visibility: visibilitySchema.optional(),
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

	bikeType: bikeTypeSchema,
	discipline: mtbDisciplineSchema.optional(),
	eBikeAllowed: z.boolean().optional(),
	format: formatSchema,
	virtualPlatforms: z.array(virtualPlatformSchema).optional(),
	homeBaseAffiliation: z
		.string()
		.trim()
		.max(200, 'Home-base affiliation must be less than 200 characters')
		.optional(),
	website: z
		.url({ protocol: /^https?$/, message: 'Invalid website URL' })
		.max(300, 'Website must be less than 300 characters')
		.optional(),
	instagram: z.string().trim().max(100).optional(),
	facebook: z.string().trim().max(100).optional(),
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
		.optional(),
	memberLimit: z
		.number()
		.int('Member limit must be a whole number')
		.min(0, 'Member limit cannot be negative')
		.optional(),
	waitlist: z.boolean().optional(),
	howToJoin: z
		.string()
		.trim()
		.max(1000, 'How to join must be less than 1000 characters')
		.optional(),

	rideSchedule: scheduleFrequencySchema.optional(),
	startTimes: z.array(teamListItemSchema).max(14).optional(),
	pace: paceSchema.optional(),
	segmentation: segmentationSchema.optional(),
	typicalDistanceMiles: z
		.number()
		.int('Distance must be a whole number')
		.min(0, 'Distance cannot be negative')
		.optional(),
	typicalElevationGainFt: z
		.number()
		.int('Elevation gain must be a whole number')
		.min(0, 'Elevation gain cannot be negative')
		.optional(),
	dropPolicy: dropPolicySchema.optional(),
	rideVisibility: visibilitySchema.optional(),

	competitiveOrCasual: competitiveOrCasualSchema,
	skillLevel: skillLevelSchema,
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
		.optional(),
	mileageMin: z
		.number()
		.int('Mileage must be a whole number')
		.min(0, 'Mileage cannot be negative')
		.optional(),
	mileageFrequency: scheduleFrequencySchema.optional(),
	requiredKit: z.boolean().optional(),
	rankingSystem: rankingSystemSchema.optional(),
	hasRoster: z.boolean().optional(),
	sponsors: z.array(teamListItemSchema).max(20).optional(),
	eventTypes: z.array(teamListItemSchema).max(10).optional(),
	joinTryouts: z.boolean().optional(),
	joinReferral: z.boolean().optional(),
	joinInviteOnly: z.boolean().optional(),
	joinOpen: z.boolean().optional(),
});

type TeamFields = z.infer<typeof teamBaseSchema>;

const ageRangeCheck = (team: Partial<TeamFields>) =>
	team.ageMin === undefined ||
	team.ageMax === undefined ||
	team.ageMin <= team.ageMax;

const mileageCheck = (team: Partial<TeamFields>) =>
	(team.mileageMin === undefined) === (team.mileageFrequency === undefined);

const ageRangeIssue = {
	message: 'Minimum age cannot be greater than maximum age',
	path: ['ageMin'],
};

const mileageIssue = {
	message: 'Mileage requirement needs both a minimum and a frequency',
	path: ['mileageMin'],
};

export const createTeamSchema = teamBaseSchema
	.refine(ageRangeCheck, ageRangeIssue)
	.refine(mileageCheck, mileageIssue);

export const updateTeamSchema = teamBaseSchema
	.partial()
	.refine(ageRangeCheck, ageRangeIssue);

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
