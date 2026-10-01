import {
	bikeType,
	clubType,
	dayOfWeek,
	dropPolicy,
	format,
	pace,
	racingDiscipline,
	rideOrdinal,
	scheduleFrequency,
	skillLevel,
	virtualPlatform,
} from '@/lib/enums';

export const CLUB_TYPES = clubType.labels;
export const BIKE_TYPES = bikeType.labels;
export const RACING_DISCIPLINES = racingDiscipline.labels;
export const FORMATS = format.labels;
export const VIRTUAL_PLATFORMS = virtualPlatform.labels;
export const SCHEDULES = scheduleFrequency.labels;
export const PACES = pace.labels;
export const DROP_POLICIES = dropPolicy.labels;
export const SKILL_LEVELS = skillLevel.labels;
export const PERSONA_OPTIONS = [
	{ value: 'womenOnly', label: 'Women only' },
	{ value: 'menOnly', label: 'Men only' },
	{ value: 'lgbtOnly', label: 'LGBT only' },
	{ value: 'other', label: 'Other' },
];
export const DAYS = dayOfWeek.labels;

export const RIDE_PATTERNS = [
	{ value: 'weekly', label: 'Every week' },
	{ value: 'biweekly', label: 'Every other week' },
	{ value: 'monthly', label: 'Certain weeks of the month' },
];
export const RIDE_ORDINALS = rideOrdinal.labels;
export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
