import {
	bikeType,
	clubType,
	competitiveOrCasual,
	mtbDiscipline,
	racingDiscipline,
	skillLevel,
} from '@/lib/enums';
import type {
	BikeType,
	ClubType,
	MtbDiscipline,
	RacingDiscipline,
	SkillLevel,
} from '@/lib/types';

const RACING_DISCIPLINES = racingDiscipline.labels;

const CLUB_TYPES = clubType.labels;
const BIKE_TYPES = bikeType.labels;
const DISCIPLINES = mtbDiscipline.labels;
const SKILL_LEVELS = skillLevel.labels;
const RACING_OPTIONS = competitiveOrCasual.labels;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const TEAMS_PAGE_SIZE = 20;
export const RADIUS_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_RADIUS_MILES = 50;

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
	const racingDisciplines = allValues(raw.racingDiscipline).filter(
		(value): value is RacingDiscipline =>
			RACING_DISCIPLINES.includes(value as RacingDiscipline),
	);
	const womensOnly = firstValue(raw.womensOnly) === 'true';
	const youthOnly = firstValue(raw.youthOnly) === 'true';
	const acceptingNewRiders = firstValue(raw.acceptingNewRiders) === 'true';
	const pageRaw = Number.parseInt(firstValue(raw.page), 10);
	const page =
		Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, MAX_PAGE) : 1;

	const radiusRaw = Number.parseInt(firstValue(raw.radius), 10);
	const radius =
		(RADIUS_OPTIONS as readonly number[]).includes(radiusRaw) ?
			radiusRaw
		:	DEFAULT_RADIUS_MILES;

	return {
		page,
		radius,
		q,
		location,
		type,
		bikeTypes,
		discipline,
		skillLevel,
		competitiveOrCasual,
		racingDisciplines,
		womensOnly,
		youthOnly,
		acceptingNewRiders,
	};
}
