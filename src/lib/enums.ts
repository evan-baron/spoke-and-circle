import type {
	BikeType as DbBikeType,
	ClubType as DbClubType,
	CompetitiveOrCasual as DbCompetitiveOrCasual,
	DropPolicy as DbDropPolicy,
	Format as DbFormat,
	MtbDiscipline as DbMtbDiscipline,
	Pace as DbPace,
	RacingDiscipline as DbRacingDiscipline,
	ScheduleFrequency as DbScheduleFrequency,
	Segmentation as DbSegmentation,
	SkillLevel as DbSkillLevel,
	VirtualPlatform as DbVirtualPlatform,
} from '../../generated/prisma/client';

type Unmapped<Db extends string, Map extends Record<string, Db>> = [
	Exclude<Db, Map[keyof Map]>,
] extends [never]
	? unknown
	: { unmappedDatabaseValues: Exclude<Db, Map[keyof Map]> };

function invert<K extends string, V extends string>(
	record: Record<K, V>,
): Record<V, K> {
	return Object.fromEntries(
		Object.entries(record).map(([key, value]) => [value, key]),
	) as Record<V, K>;
}

function defineEnum<Db extends string>() {
	return <const Map extends Record<string, Db>>(map: Map & Unmapped<Db, Map>) => {
		type Label = keyof Map & string;
		return {
			labels: Object.keys(map) as unknown as readonly [Label, ...Label[]],
			toDb: map as Record<Label, Db>,
			fromDb: invert(map as Record<Label, Db>),
		};
	};
}

function defineList<const Items extends readonly [string, ...string[]]>(
	items: Items,
) {
	return { labels: items };
}

export const clubType = defineEnum<DbClubType>()({
	Team: 'Team',
	Club: 'Club',
	'Group Ride': 'GroupRide',
	'Youth Program': 'YouthProgram',
	Organization: 'Organization',
	Association: 'Association',
});

export const bikeType = defineEnum<DbBikeType>()({
	Road: 'Road',
	Gravel: 'Gravel',
	Cyclocross: 'Cyclocross',
	MTB: 'MTB',
	Track: 'Track',
	BMX: 'BMX',
	Tri: 'Tri',
	'E-bike': 'EBike',
	Mixed: 'Mixed',
});

export const racingDiscipline = defineEnum<DbRacingDiscipline>()({
	Road: 'Road',
	Criterium: 'Criterium',
	'Time Trial': 'TimeTrial',
	'Stage Racing': 'StageRacing',
	'Hill Climb': 'HillClimb',
	Gravel: 'Gravel',
	Cyclocross: 'Cyclocross',
	Track: 'Track',
	'Cross-Country': 'CrossCountry',
	'Cross-Country Marathon': 'CrossCountryMarathon',
	'Short Track': 'ShortTrack',
	Downhill: 'Downhill',
	Enduro: 'Enduro',
	'Dual Slalom': 'DualSlalom',
	'Four-Cross': 'FourCross',
	Slopestyle: 'Slopestyle',
	'BMX Racing': 'BmxRacing',
	Freestyle: 'Freestyle',
	'Ultra-Endurance': 'UltraEndurance',
	Triathlon: 'Triathlon',
	Virtual: 'Virtual',
});

export const format = defineEnum<DbFormat>()({
	'In-person': 'InPerson',
	Virtual: 'Virtual',
	Hybrid: 'Hybrid',
});

export const virtualPlatform = defineEnum<DbVirtualPlatform>()({
	Zwift: 'Zwift',
	Strava: 'Strava',
	TrainerRoad: 'TrainerRoad',
	Other: 'Other',
});

export const pace = defineEnum<DbPace>()({
	Relaxed: 'Relaxed',
	Steady: 'Steady',
	Competitive: 'Competitive',
});

export const skillLevel = defineEnum<DbSkillLevel>()({
	Beginner: 'Beginner',
	Intermediate: 'Intermediate',
	Advanced: 'Advanced',
	Expert: 'Expert',
	Elite: 'Elite',
});

export const mtbDiscipline = defineEnum<DbMtbDiscipline>()({
	'Cross-country': 'CrossCountry',
	Trail: 'Trail',
	Enduro: 'Enduro',
	Downhill: 'Downhill',
	'All-mountain': 'AllMountain',
});

export const segmentation = defineEnum<DbSegmentation>()({
	'A Group': 'AGroup',
	'B Group': 'BGroup',
	'C Group': 'CGroup',
	'N/A': 'NA',
});

export const scheduleFrequency = defineEnum<DbScheduleFrequency>()({
	Weekly: 'Weekly',
	Monthly: 'Monthly',
	Annually: 'Annually',
});

export const dropPolicy = defineEnum<DbDropPolicy>()({
	Drop: 'Drop',
	'No-drop': 'NoDrop',
});

export const competitiveOrCasual = defineEnum<DbCompetitiveOrCasual>()({
	Competitive: 'Competitive',
	Recreational: 'Recreational',
});

export const eventType = defineList([
	'Sponsor Events',
	'Team-specific Events',
	'Public Events',
	'Recruiting Events',
]);

export const dayOfWeek = defineList([
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
]);

export const rideOrdinal = defineList(['1st', '2nd', '3rd', '4th', 'Last']);

export type ClubType = (typeof clubType.labels)[number];
export type BikeType = (typeof bikeType.labels)[number];
export type RacingDiscipline = (typeof racingDiscipline.labels)[number];
export type Format = (typeof format.labels)[number];
export type VirtualPlatform = (typeof virtualPlatform.labels)[number];
export type Pace = (typeof pace.labels)[number];
export type SkillLevel = (typeof skillLevel.labels)[number];
export type MtbDiscipline = (typeof mtbDiscipline.labels)[number];
export type Segmentation = (typeof segmentation.labels)[number];
export type ScheduleFrequency = (typeof scheduleFrequency.labels)[number];
export type DropPolicy = (typeof dropPolicy.labels)[number];
export type CompetitiveOrCasual = (typeof competitiveOrCasual.labels)[number];
export type EventType = (typeof eventType.labels)[number];
export type DayOfWeek = (typeof dayOfWeek.labels)[number];
export type RideOrdinal = (typeof rideOrdinal.labels)[number];
