import { dayOfWeek, rideOrdinal } from '@/lib/enums';
import type { Ride } from '@/lib/types';

const MS_PER_DAY = 86_400_000;
const ORDINALS = rideOrdinal.labels;
const LAST_ORDINAL = 'Last' as const;
const WEEKDAY_BY_UTC_INDEX = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
] as const satisfies readonly (typeof dayOfWeek.labels)[number][];

export function toDayNumber(isoDate: string): number {
	const [year = 1970, month = 1, day = 1] = isoDate.split('-').map(Number);
	return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

export function fromDayNumber(dayNumber: number): string {
	return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function mondayOfWeek(dayNumber: number): number {
	const weekday = new Date(dayNumber * MS_PER_DAY).getUTCDay();
	return dayNumber - ((weekday + 6) % 7);
}

function inSeason(ride: Ride, month: number): boolean {
	const { monthFrom, monthTo } = ride;
	if (!monthFrom || !monthTo) return true;
	return monthFrom <= monthTo ?
			month >= monthFrom && month <= monthTo
		:	month >= monthFrom || month <= monthTo;
}

function matchesMonthlyOrdinal(
	ride: Ride,
	year: number,
	month: number,
	day: number,
): boolean {
	const ordinals = ride.ordinals ?? [];
	const nth = ORDINALS[Math.floor((day - 1) / 7)];
	if (nth && ordinals.includes(nth)) return true;
	const isLast = day + 7 > daysInMonth(year, month);
	return isLast && ordinals.includes(LAST_ORDINAL);
}

export function expandRide(
	ride: Ride,
	rangeStart: string,
	rangeEnd: string,
): string[] {
	const first = toDayNumber(rangeStart);
	const last = toDayNumber(rangeEnd);
	const startDay = ride.startDate ? toDayNumber(ride.startDate) : null;
	const anchorWeek = startDay === null ? null : mondayOfWeek(startDay);
	const occurrences: string[] = [];

	for (let dayNumber = first; dayNumber <= last; dayNumber += 1) {
		if (startDay !== null && dayNumber < startDay) continue;

		const date = new Date(dayNumber * MS_PER_DAY);
		const weekday = WEEKDAY_BY_UTC_INDEX[date.getUTCDay()];
		if (!weekday || !ride.days.includes(weekday)) continue;

		const year = date.getUTCFullYear();
		const month = date.getUTCMonth() + 1;
		if (!inSeason(ride, month)) continue;

		if (ride.pattern === 'biweekly') {
			if (anchorWeek === null) continue;
			const weeksApart = (mondayOfWeek(dayNumber) - anchorWeek) / 7;
			if (weeksApart % 2 !== 0) continue;
		}

		if (
			ride.pattern === 'monthly' &&
			!matchesMonthlyOrdinal(ride, year, month, date.getUTCDate())
		) {
			continue;
		}

		occurrences.push(fromDayNumber(dayNumber));
	}

	return occurrences;
}
