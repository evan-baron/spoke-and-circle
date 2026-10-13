import { describe, expect, it } from 'vitest';
import {
	ALL_SKILL_LEVELS_LABEL,
	formatClockTime,
	formatMemberCount,
	formatRideDates,
	formatRideParts,
	formatRideRecurrence,
	formatRideTime,
	formatSkillLevelLines,
	formatSkillLevels,
	isAllSkillLevels,
} from './format';
import { skillLevel } from './enums';

describe('skill level formatting', () => {
	it('collapses to one label when every level is present, in any order', () => {
		const reversed = [...skillLevel.labels].reverse();
		expect(isAllSkillLevels(reversed)).toBe(true);
		expect(formatSkillLevelLines(reversed)).toEqual([ALL_SKILL_LEVELS_LABEL]);
		expect(formatSkillLevels([...skillLevel.labels])).toBe(
			ALL_SKILL_LEVELS_LABEL,
		);
	});

	it('lists the levels when some are missing', () => {
		expect(isAllSkillLevels(['Beginner', 'Expert'])).toBe(false);
		expect(formatSkillLevels(['Beginner', 'Expert'])).toBe('Beginner, Expert');
		expect(formatSkillLevelLines([])).toEqual([]);
	});
});

describe('formatMemberCount', () => {
	it('uses the singular for exactly one member', () => {
		expect(formatMemberCount(1)).toBe('1 member');
		expect(formatMemberCount(0)).toBe('0 members');
		expect(formatMemberCount(42)).toBe('42 members');
	});
});

describe('formatClockTime', () => {
	it('converts 24-hour times to 12-hour times', () => {
		expect(formatClockTime('00:05')).toBe('12:05 AM');
		expect(formatClockTime('09:30')).toBe('9:30 AM');
		expect(formatClockTime('12:00')).toBe('12:00 PM');
		expect(formatClockTime('18:45')).toBe('6:45 PM');
	});
});

describe('formatRideRecurrence', () => {
	it('describes weekly rides with sorted days and a start time', () => {
		expect(
			formatRideRecurrence({
				pattern: 'weekly',
				days: ['Thursday', 'Tuesday'],
				startTime: '18:00',
			}),
		).toBe('Every Tuesday and Thursday · 6:00 PM');
	});

	it('describes every-other-week rides', () => {
		expect(
			formatRideRecurrence({ pattern: 'biweekly', days: ['Saturday'] }),
		).toBe('Every other Saturday');
	});

	it('describes monthly rides with ordered weeks and a month range', () => {
		expect(
			formatRideRecurrence({
				pattern: 'monthly',
				days: ['Sunday'],
				ordinals: ['Last', '1st'],
				monthFrom: 4,
				monthTo: 9,
			}),
		).toBe('1st and Last Sunday of the month · April–September');
	});

	it('shows a single month once when the range is one month', () => {
		expect(
			formatRideRecurrence({
				pattern: 'weekly',
				days: ['Friday'],
				monthFrom: 6,
				monthTo: 6,
			}),
		).toBe('Every Friday · June');
	});
});

describe('formatRideTime and formatRideDates', () => {
	const ride = {
		pattern: 'monthly' as const,
		days: ['Sunday'],
		ordinals: ['1st' as const],
		startTime: '07:30',
		monthFrom: 4,
		monthTo: 9,
	};

	it('splits the start time from the dates', () => {
		expect(formatRideTime(ride)).toBe('7:30 AM');
		expect(formatRideDates(ride)).toBe('1st Sunday of the month · April–September');
	});

	it('returns no time when the ride has no start time', () => {
		expect(formatRideTime({ pattern: 'weekly', days: ['Friday'] })).toBeNull();
		expect(formatRideDates({ pattern: 'weekly', days: ['Friday'] })).toBe(
			'Every Friday',
		);
	});
});

describe('formatRideParts', () => {
	it('returns the cadence, time and months separately', () => {
		expect(
			formatRideParts({
				pattern: 'weekly',
				days: ['Thursday'],
				startTime: '17:30',
				monthFrom: 3,
				monthTo: 10,
			}),
		).toEqual({
			cadence: 'Every Thursday',
			time: '5:30 PM',
			months: 'March–October',
		});
	});

	it('has no months for a year-round ride', () => {
		expect(
			formatRideParts({ pattern: 'weekly', days: ['Thursday'] }).months,
		).toBeNull();
	});
});
