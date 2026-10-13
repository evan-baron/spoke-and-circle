import { describe, expect, it } from 'vitest';
import { expandRide, fromDayNumber, toDayNumber } from './rideSchedule';
import type { Ride } from './types';

describe('day numbers', () => {
	it('round-trips ISO dates', () => {
		expect(fromDayNumber(toDayNumber('2026-10-13'))).toBe('2026-10-13');
		expect(fromDayNumber(toDayNumber('2024-02-29'))).toBe('2024-02-29');
	});
});

describe('expandRide', () => {
	it('expands a weekly ride on several days', () => {
		const ride: Ride = { pattern: 'weekly', days: ['Tuesday', 'Thursday'] };
		expect(expandRide(ride, '2026-10-01', '2026-10-14')).toEqual([
			'2026-10-01',
			'2026-10-06',
			'2026-10-08',
			'2026-10-13',
		]);
	});

	it('alternates weeks from the start date across month boundaries', () => {
		const ride: Ride = {
			pattern: 'biweekly',
			days: ['Saturday'],
			startDate: '2026-10-03',
		};
		expect(expandRide(ride, '2026-10-01', '2026-11-30')).toEqual([
			'2026-10-03',
			'2026-10-17',
			'2026-10-31',
			'2026-11-14',
			'2026-11-28',
		]);
	});

	it('does not produce rides before the start date', () => {
		const ride: Ride = {
			pattern: 'weekly',
			days: ['Wednesday'],
			startDate: '2026-10-14',
		};
		expect(expandRide(ride, '2026-10-01', '2026-10-21')).toEqual([
			'2026-10-14',
			'2026-10-21',
		]);
	});

	it('handles first, third and last weekdays of the month', () => {
		const first: Ride = {
			pattern: 'monthly',
			days: ['Sunday'],
			ordinals: ['1st'],
		};
		expect(expandRide(first, '2026-10-01', '2026-10-31')).toEqual([
			'2026-10-04',
		]);

		const third: Ride = {
			pattern: 'monthly',
			days: ['Sunday'],
			ordinals: ['3rd'],
		};
		expect(expandRide(third, '2026-10-01', '2026-10-31')).toEqual([
			'2026-10-18',
		]);

		const last: Ride = {
			pattern: 'monthly',
			days: ['Sunday'],
			ordinals: ['Last'],
		};
		expect(expandRide(last, '2026-10-01', '2026-10-31')).toEqual([
			'2026-10-25',
		]);
	});

	it('treats a fifth weekday as the last one', () => {
		const last: Ride = {
			pattern: 'monthly',
			days: ['Thursday'],
			ordinals: ['Last'],
		};
		expect(expandRide(last, '2026-10-01', '2026-10-31')).toEqual([
			'2026-10-29',
		]);
	});

	it('honors a season window', () => {
		const ride: Ride = {
			pattern: 'weekly',
			days: ['Monday'],
			monthFrom: 11,
			monthTo: 11,
		};
		expect(expandRide(ride, '2026-10-26', '2026-11-09')).toEqual([
			'2026-11-02',
			'2026-11-09',
		]);
	});

	it('supports a season that wraps the new year', () => {
		const ride: Ride = {
			pattern: 'weekly',
			days: ['Monday'],
			monthFrom: 11,
			monthTo: 2,
		};
		expect(expandRide(ride, '2026-03-01', '2026-03-31')).toEqual([]);
		expect(expandRide(ride, '2027-01-01', '2027-01-10')).toEqual([
			'2027-01-04',
		]);
	});

	it('returns nothing for a biweekly ride without a start date', () => {
		const ride: Ride = { pattern: 'biweekly', days: ['Saturday'] };
		expect(expandRide(ride, '2026-10-01', '2026-10-31')).toEqual([]);
	});
});
