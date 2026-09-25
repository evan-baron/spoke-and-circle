import type { BikeType, ClubType, MtbDiscipline, SkillLevel } from '@/lib/types';

const CLUB_TYPES: ClubType[] = [
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
];
const BIKE_TYPES: BikeType[] = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'Tri',
	'E-bike',
	'Mixed',
];
const DISCIPLINES: MtbDiscipline[] = [
	'Cross-country',
	'Trail',
	'Enduro',
	'Downhill',
	'All-mountain',
];
const SKILL_LEVELS: SkillLevel[] = [
	'Beginner',
	'Intermediate',
	'Advanced',
	'Expert',
];
const RACING_OPTIONS = ['Competitive', 'Casual'] as const;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const TEAMS_PAGE_SIZE = 20;

const MAX_PAGE = 10000;
const MAX_PARAM_LENGTH = 100;
const MAX_PARAM_VALUES = 10;

function firstValue(value: string | string[] | undefined): string {
	const first = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
	return first.slice(0, MAX_PARAM_LENGTH);
}

function allValues(value: string | string[] | undefined): string[] {
	const values = Array.isArray(value) ? value : value ? [value] : [];
	return values
		.slice(0, MAX_PARAM_VALUES)
		.map((item) => item.slice(0, MAX_PARAM_LENGTH));
}

export function parseSearchParams(raw: RawSearchParams) {
	const q = firstValue(raw.q);
	const location = firstValue(raw.location);
	const typeRaw = firstValue(raw.type);
	const disciplineRaw = firstValue(raw.discipline);
	const skillLevelRaw = firstValue(raw.skillLevel);
	const competitiveOrCasualRaw = firstValue(raw.competitiveOrCasual);

	const type =
		CLUB_TYPES.includes(typeRaw as ClubType) ?
			(typeRaw as ClubType)
		:	undefined;
	const bikeTypes = allValues(raw.bikeType).filter((value): value is BikeType =>
		BIKE_TYPES.includes(value as BikeType),
	);
	const discipline =
		DISCIPLINES.includes(disciplineRaw as MtbDiscipline) ?
			(disciplineRaw as MtbDiscipline)
		:	undefined;
	const skillLevel =
		SKILL_LEVELS.includes(skillLevelRaw as SkillLevel) ?
			(skillLevelRaw as SkillLevel)
		:	undefined;
	const competitiveOrCasual =
		(RACING_OPTIONS as readonly string[]).includes(competitiveOrCasualRaw) ?
			(competitiveOrCasualRaw as (typeof RACING_OPTIONS)[number])
		:	undefined;
	const womensOnly = firstValue(raw.womensOnly) === 'true';
	const youthOnly = firstValue(raw.youthOnly) === 'true';
	const acceptingNewRiders = firstValue(raw.acceptingNewRiders) === 'true';
	const pageRaw = Number.parseInt(firstValue(raw.page), 10);
	const page =
		Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, MAX_PAGE) : 1;

	return {
		page,
		q,
		location,
		type,
		bikeTypes,
		discipline,
		skillLevel,
		competitiveOrCasual,
		womensOnly,
		youthOnly,
		acceptingNewRiders,
	};
}
