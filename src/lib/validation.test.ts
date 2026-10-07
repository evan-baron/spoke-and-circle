import { describe, expect, it } from 'vitest';
import * as registry from './enums';
import { createTeamSchema, deleteTeamsSchema } from './validation';

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
	return result.success ?
			[]
		:	result.error.issues.map((issue) => issue.message);
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
		expect(parse({ mileageMin: 20, mileageFrequency: 'Weekly' }).success).toBe(
			true,
		);
	});

	it('requires a name and a location', () => {
		expect(messages({ name: '   ' })).toContain('Name is required');
		expect(messages({ location: '' })).toContain('Location is required');
	});

	describe('additionalRideDetails', () => {
		it('keeps paragraph breaks and normalizes line endings', () => {
			const result = parse({
				type: 'Group Ride',
				additionalRideDetails: '  First paragraph.\r\n\r\nSecond paragraph.  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.additionalRideDetails).toBe(
					'First paragraph.\n\nSecond paragraph.',
				);
			}
		});

		it('counts a Windows line break as one character toward the limit', () => {
			const lines = ['a'.repeat(499), 'b'.repeat(500)].join('\r\n');
			expect(parse({ additionalRideDetails: lines }).success).toBe(true);
		});

		it('rejects more than 1,000 characters', () => {
			expect(messages({ additionalRideDetails: 'x'.repeat(1001) })).toContain(
				'Additional ride details must be 1,000 characters or fewer',
			);
			expect(parse({ additionalRideDetails: 'x'.repeat(1000) }).success).toBe(
				true,
			);
		});
	});

	describe('media', () => {
		const validId = 'assets/spoke_and_circle_uploads/u12/0123456789abcdef01234567';

		it('accepts well-formed public ids', () => {
			expect(parse({ media: [{ publicId: validId }] }).success).toBe(true);
		});

		it('rejects ids outside the teams folder', () => {
			expect(
				parse({ media: [{ publicId: 'other/u12/0123456789abcdef' }] }).success,
			).toBe(false);
			expect(
				parse({ media: [{ publicId: 'assets/spoke_and_circle_uploads/u12/../../x' }] }).success,
			).toBe(false);
		});

		it('rejects more than the maximum number of photos', () => {
			const media = Array.from({ length: 7 }, (_, index) => ({
				publicId: `assets/spoke_and_circle_uploads/u12/0123456789abcdef0123456${index}`,
			}));
			expect(parse({ media }).success).toBe(false);
		});
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

describe('deleteTeamsSchema', () => {
	it('accepts a list of team ids', () => {
		expect(deleteTeamsSchema.safeParse({ ids: ['a', 'b'] }).success).toBe(true);
	});

	it('rejects an empty list, blank ids and more than 100 ids', () => {
		expect(deleteTeamsSchema.safeParse({ ids: [] }).success).toBe(false);
		expect(deleteTeamsSchema.safeParse({ ids: ['  '] }).success).toBe(false);
		expect(
			deleteTeamsSchema.safeParse({
				ids: Array.from({ length: 101 }, (_, index) => `team-${index}`),
			}).success,
		).toBe(false);
		expect(deleteTeamsSchema.safeParse({}).success).toBe(false);
	});
});
