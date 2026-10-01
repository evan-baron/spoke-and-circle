import type { AgeRequirement, MileageRequirement, Ride, Team } from './types';

const WEEKDAY_ORDER = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];

const ORDINAL_ORDER = ['1st', '2nd', '3rd', '4th', 'Last'];

const MONTH_NAMES = [
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

export function formatMemberCount(count: number): string {
	return `${count} members`;
}

export function formatDistance(miles: number): string {
	return `${miles} mi`;
}

export function formatElevation(feet: number): string {
	return feet > 0 ? `${feet.toLocaleString()} ft` : 'Flat';
}

export function formatAgeRequirement(age?: AgeRequirement): string {
	if (!age || (age.min === undefined && age.max === undefined)) return 'None';
	if (age.min !== undefined && age.max !== undefined)
		return `${age.min}–${age.max}`;
	if (age.min !== undefined) return `${age.min}+`;
	return `Up to ${age.max}`;
}

export function formatMileageRequirement(req?: MileageRequirement): string {
	if (!req) return 'None';
	return `${req.min} mi / ${req.frequency.toLowerCase()}`;
}

export function formatList(items?: string[]): string {
	if (!items || items.length === 0) return 'None';
	return items.join(', ');
}

export function formatYesNo(value: boolean): string {
	return value ? 'Yes' : 'No';
}

export function formatVerification(
	verified: boolean,
	lastActiveYear: number,
): string {
	if (!verified) return 'Unverified';
	return lastActiveYear ? `Verified · Active ${lastActiveYear}` : 'Verified';
}

export function formatSubmittedDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}

export function isMissingName(name: string | null | undefined): boolean {
	return !name || name.includes('@');
}

export function formatSubmitter(
	user: {
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null,
): string {
	if (!user) return 'Anonymous';
	const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
	return name || user.email;
}

export const ALL_SKILL_LEVELS = [
	'Beginner',
	'Intermediate',
	'Advanced',
	'Expert',
] as const;

export const ALL_SKILL_LEVELS_LABEL = 'All levels welcome';

export function isAllSkillLevels(levels: readonly string[]): boolean {
	return ALL_SKILL_LEVELS.every((level) => levels.includes(level));
}

export function formatSkillLevelLines(levels: readonly string[]): string[] {
	return isAllSkillLevels(levels) ? [ALL_SKILL_LEVELS_LABEL] : [...levels];
}

export function formatSkillLevels(levels: string[]): string {
	return formatSkillLevelLines(levels).join(', ');
}

function joinWithAnd(items: string[]): string {
	if (items.length <= 1) return items.join('');
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function sortByOrder(items: string[], order: string[]): string[] {
	return [...items].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export function formatClockTime(time: string): string {
	const [hours = 0, minutes = 0] = time.split(':').map(Number);
	const period = hours >= 12 ? 'PM' : 'AM';
	return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatRideRecurrence(ride: Ride): string {
	const days = joinWithAnd(sortByOrder(ride.days, WEEKDAY_ORDER));
	const weeks = joinWithAnd(sortByOrder(ride.ordinals ?? [], ORDINAL_ORDER));

	const cadence =
		ride.pattern === 'monthly' ? `${weeks} ${days} of the month`
		: ride.pattern === 'biweekly' ? `Every other ${days}`
		: `Every ${days}`;

	const months =
		ride.monthFrom && ride.monthTo ?
			ride.monthFrom === ride.monthTo ?
				MONTH_NAMES[ride.monthFrom - 1]
			:	`${MONTH_NAMES[ride.monthFrom - 1]}–${MONTH_NAMES[ride.monthTo - 1]}`
		:	null;

	return [cadence, ride.startTime && formatClockTime(ride.startTime), months]
		.filter(Boolean)
		.join(' · ');
}

export function getTeamLocations(
	team: Pick<Team, 'location' | 'additionalLocations'>,
): string[] {
	return [team.location, ...(team.additionalLocations ?? [])];
}
