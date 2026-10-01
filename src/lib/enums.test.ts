import { describe, expect, it } from 'vitest';
import * as db from '../../generated/prisma/client';
import * as registry from './enums';

const prismaEnums = {
	clubType: db.ClubType,
	bikeType: db.BikeType,
	racingDiscipline: db.RacingDiscipline,
	format: db.Format,
	virtualPlatform: db.VirtualPlatform,
	pace: db.Pace,
	skillLevel: db.SkillLevel,
	mtbDiscipline: db.MtbDiscipline,
	segmentation: db.Segmentation,
	scheduleFrequency: db.ScheduleFrequency,
	dropPolicy: db.DropPolicy,
	competitiveOrCasual: db.CompetitiveOrCasual,
} as const;

describe.each(Object.entries(prismaEnums))('%s registry', (name, prismaEnum) => {
	const entry = registry[name as keyof typeof prismaEnums];
	const labels: readonly string[] = entry.labels;
	const toDb: Record<string, string> = entry.toDb;
	const fromDb: Record<string, string> = entry.fromDb;

	it('has unique, non-empty labels', () => {
		expect(labels.length).toBeGreaterThan(0);
		expect(new Set(labels).size).toBe(labels.length);
		expect(labels.every((label) => label.trim().length > 0)).toBe(true);
	});

	it('round-trips every label through the database value', () => {
		for (const label of labels) {
			expect(fromDb[toDb[label] as string]).toBe(label);
		}
	});

	it('maps exactly the values the Prisma enum defines', () => {
		expect(Object.values(toDb).sort()).toEqual(
			Object.values(prismaEnum).sort(),
		);
	});
});

describe.each([
	['eventType', registry.eventType],
	['dayOfWeek', registry.dayOfWeek],
	['rideOrdinal', registry.rideOrdinal],
])('%s list', (_name, list) => {
	it('has unique, non-empty labels', () => {
		const labels: readonly string[] = list.labels;
		expect(labels.length).toBeGreaterThan(0);
		expect(new Set(labels).size).toBe(labels.length);
		expect(labels.every((label) => label.trim().length > 0)).toBe(true);
	});
});
