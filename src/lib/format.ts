import type {
	AgeRequirement,
	MileageRequirement,
	RideDay,
	Team,
} from './types';

const WEEKDAY_ORDER = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
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

export function formatSkillLevels(levels: string[]): string {
	return levels.join(', ');
}

export function formatRideDays(days?: RideDay[]): string {
	if (!days || days.length === 0) return 'None';
	return [...days]
		.sort((a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day))
		.map((entry) =>
			entry.details ? `${entry.day} - (${entry.details})` : entry.day,
		)
		.join(', ');
}

export function getTeamLocations(
	team: Pick<Team, 'location' | 'additionalLocations'>,
): string[] {
	return [team.location, ...(team.additionalLocations ?? [])];
}
