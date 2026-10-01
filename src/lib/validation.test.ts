import { describe, expect, it } from 'vitest';
import * as registry from './enums';
import { createTeamSchema } from './validation';

const validTeam = {
	name: 'Test Team',
	type: 'Team',
	location: 'Denver, CO',
	bikeTypes: ['Road'],
	format: 'In-person',
	skillLevels: ['Beginner'],
	competitiveOrCasual: 'Recreational',
};

function parse(patch: Record<string, unknown>) {
	return createTeamSchema.safeParse({ ...validTeam, ...patch });
}

function messages(patch: Record<string, unknown>) {
	const result = parse(patch);
	return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('createTeamSchema', () => {
	it('accepts a minimal valid team', () => {
		expect(parse({}).success).toBe(true);
	});

	describe.each([
		['type', registry.clubType, false],
		['bikeTypes', registry.bikeType, true],
		['racingDisciplines', registry.racingDiscipline, true],
		['format', registry.format, false],
		['virtualPlatforms', registry.virtualPlatform, true],
		['pace', registry.pace, false],
		['dropPolicy', registry.dropPolicy, false],
		['skillLevels', registry.skillLevel, true],
		['competitiveOrCasual', registry.competitiveOrCasual, false],
		['discipline', registry.mtbDiscipline, false],
		['segmentation', registry.segmentation, false],
	] as const)('%s', (field, entry, isList) => {
		const wrap = (value: string) => (isList ? [value] : value);

		it('accepts every registered label', () => {
			for (const label of entry.labels) {
				expect(parse({ [field]: wrap(label) }).success).toBe(true);
			}
		});

		it('rejects an unknown label', () => {
			expect(parse({ [field]: wrap('__unknown__') }).success).toBe(false);
		});
	});

	it('requires at least one cycling discipline', () => {
		expect(messages({ bikeTypes: [] })).toContain(
			'Choose at least one cycling discipline',
		);
	});

	it('requires at least one skill level', () => {
		expect(messages({ skillLevels: [] })).toContain(
			'Choose at least one skill level',
		);
	});

	it('requires competitive or recreational for everything except group rides', () => {
		expect(messages({ competitiveOrCasual: undefined })).toContain(
			'Competitive or recreational is required',
		);
		expect(
			parse({ type: 'Group Ride', competitiveOrCasual: undefined }).success,
		).toBe(true);
	});

	it('rejects a minimum age above the maximum age', () => {
		expect(messages({ ageMin: 40, ageMax: 20 })).toContain(
			'Minimum age cannot be greater than maximum age',
		);
		expect(parse({ ageMin: 20, ageMax: 40 }).success).toBe(true);
	});

	it('requires mileage and frequency together', () => {
		expect(messages({ mileageMin: 20 })).toContain(
			'Mileage requirement needs both a minimum and a frequency',
		);
		expect(messages({ mileageFrequency: 'Weekly' })).toContain(
			'Mileage requirement needs both a minimum and a frequency',
		);
		expect(
			parse({ mileageMin: 20, mileageFrequency: 'Weekly' }).success,
		).toBe(true);
	});

	it('requires a name and a location', () => {
		expect(messages({ name: '   ' })).toContain('Name is required');
		expect(messages({ location: '' })).toContain('Location is required');
	});

	describe('tags', () => {
		it('accepts up to 10 tags and trims and lowercases them', () => {
			const result = parse({ tags: ['  Women Only ', 'MASTERS'] });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tags).toEqual(['women only', 'masters']);
			}
		});

		it('rejects more than 10 tags', () => {
			const tags = Array.from({ length: 11 }, (_, index) => `tag${index}`);
			expect(messages({ tags })).toContain('Add up to 10 tags');
		});

		it('rejects empty and over-long tags', () => {
			expect(messages({ tags: ['   '] })).toContain('Tags cannot be empty');
			expect(messages({ tags: ['x'.repeat(41)] })).toContain(
				'Tags must be 40 characters or fewer',
			);
		});
	});
});
