import { describe, expect, it } from 'vitest';
import { bikeType, clubType, racingDiscipline, skillLevel } from './enums';
import { DEFAULT_RADIUS_MILES, parseSearchParams } from './searchParams';

describe('parseSearchParams', () => {
	it('returns sensible defaults for an empty query', () => {
		const params = parseSearchParams({});
		expect(params.page).toBe(1);
		expect(params.radius).toBe(DEFAULT_RADIUS_MILES);
		expect(params.type).toBeUndefined();
		expect(params.skillLevel).toBeUndefined();
		expect(params.competitiveOrCasual).toBeUndefined();
		expect(params.bikeTypes).toEqual([]);
		expect(params.racingDisciplines).toEqual([]);
		expect(params.womensOnly).toBe(false);
	});

	it('accepts every registered single-value option', () => {
		for (const label of clubType.labels) {
			expect(parseSearchParams({ type: label }).type).toBe(label);
		}
		for (const label of skillLevel.labels) {
			expect(parseSearchParams({ skillLevel: label }).skillLevel).toBe(label);
		}
		expect(
			parseSearchParams({ competitiveOrCasual: 'Recreational' })
				.competitiveOrCasual,
		).toBe('Recreational');
	});

	it('drops unknown single-value options', () => {
		const params = parseSearchParams({
			type: 'Cult',
			skillLevel: 'Legend',
			competitiveOrCasual: 'Casual',
			discipline: 'Bunnyhop',
		});
		expect(params.type).toBeUndefined();
		expect(params.skillLevel).toBeUndefined();
		expect(params.competitiveOrCasual).toBeUndefined();
		expect(params.discipline).toBeUndefined();
	});

	it('keeps only known values in list options', () => {
		const params = parseSearchParams({
			bikeType: ['Road', 'Unicycle', 'Gravel'],
			racingDiscipline: ['Criterium', 'Sumo', 'Enduro'],
		});
		expect(params.bikeTypes).toEqual(['Road', 'Gravel']);
		expect(params.racingDisciplines).toEqual(['Criterium', 'Enduro']);
	});

	it('accepts every registered list option', () => {
		expect(
			parseSearchParams({ bikeType: [...bikeType.labels] }).bikeTypes,
		).toEqual([...bikeType.labels]);
		const firstTen = racingDiscipline.labels.slice(0, 10);
		expect(
			parseSearchParams({ racingDiscipline: firstTen }).racingDisciplines,
		).toEqual(firstTen);
	});

	it('caps the number of values it will read for a list option', () => {
		const many = Array.from({ length: 30 }, () => 'Road');
		expect(parseSearchParams({ bikeType: many }).bikeTypes).toHaveLength(10);
	});

	it('truncates very long text values', () => {
		expect(parseSearchParams({ q: 'a'.repeat(500) }).q).toHaveLength(100);
	});

	it('clamps and defaults the page number', () => {
		expect(parseSearchParams({ page: '3' }).page).toBe(3);
		expect(parseSearchParams({ page: '0' }).page).toBe(1);
		expect(parseSearchParams({ page: '-4' }).page).toBe(1);
		expect(parseSearchParams({ page: 'abc' }).page).toBe(1);
		expect(parseSearchParams({ page: '99999999' }).page).toBe(10000);
	});

	it('only accepts the offered search radii', () => {
		expect(parseSearchParams({ radius: '25' }).radius).toBe(25);
		expect(parseSearchParams({ radius: '7' }).radius).toBe(
			DEFAULT_RADIUS_MILES,
		);
	});

	it('reads the boolean toggles only when set to "true"', () => {
		const params = parseSearchParams({
			womensOnly: 'true',
			youthOnly: 'yes',
			acceptingNewRiders: 'true',
		});
		expect(params.womensOnly).toBe(true);
		expect(params.youthOnly).toBe(false);
		expect(params.acceptingNewRiders).toBe(true);
	});
});
