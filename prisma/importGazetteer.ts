import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Prisma } from '../generated/prisma/client';
import { cleanPlaceName, parseGazetteer } from '../src/lib/gazetteer';

const DATA_DIR = join(process.cwd(), 'data', 'gazetteer');
const BATCH_SIZE = 2000;

function findFile(suffix: string): string {
	const file = readdirSync(DATA_DIR).find((name) => name.endsWith(suffix));
	if (!file) {
		throw new Error(
			`No file ending in ${suffix} in ${DATA_DIR}. See "US Census gazetteer" in src/README.md.`,
		);
	}
	return join(DATA_DIR, file);
}

function readRows(suffix: string) {
	return parseGazetteer(readFileSync(findFile(suffix), 'utf8'));
}

function toCities(): Prisma.PlaceCreateManyInput[] {
	return readRows('_Gaz_place_national.txt').map((row) => {
		const name = cleanPlaceName(row.NAME ?? '');
		const state = row.USPS ?? '';
		return {
			id: `place-${row.GEOID}`,
			kind: 'City',
			name,
			state,
			label: `${name}, ${state}`,
			latitude: Number(row.INTPTLAT),
			longitude: Number(row.INTPTLONG),
			landAreaSqMi: Number(row.ALAND_SQMI),
		};
	});
}

function toZips(): Prisma.PlaceCreateManyInput[] {
	return readRows('_Gaz_zcta_national.txt').map((row) => ({
		id: `zip-${row.GEOID}`,
		kind: 'Zip',
		name: row.GEOID ?? '',
		zip: row.GEOID,
		label: row.GEOID ?? '',
		latitude: Number(row.INTPTLAT),
		longitude: Number(row.INTPTLONG),
		landAreaSqMi: Number(row.ALAND_SQMI),
	}));
}

const cityKey = (name: string, state: string) =>
	`${name.toLowerCase()}|${state}`;

function toExtraCities(
	knownCities: Prisma.PlaceCreateManyInput[],
): Prisma.PlaceCreateManyInput[] {
	const knownKeys = new Set(
		knownCities.map((city) => cityKey(city.name, city.state ?? '')),
	);
	const knownStates = new Set(knownCities.map((city) => city.state));
	const text = readFileSync(join(DATA_DIR, 'US.txt'), 'utf8');
	const grouped = new Map<
		string,
		{ name: string; state: string; points: [number, number][] }
	>();

	for (const line of text.split(/\r?\n/)) {
		const cells = line.split('\t');
		const name = cells[2]?.trim() ?? '';
		const state = cells[4]?.trim() ?? '';
		const latitude = Number(cells[9]);
		const longitude = Number(cells[10]);
		if (!name || !knownStates.has(state)) continue;
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

		const key = cityKey(name, state);
		if (knownKeys.has(key)) continue;

		const entry = grouped.get(key) ?? { name, state, points: [] };
		entry.points.push([latitude, longitude]);
		grouped.set(key, entry);
	}

	const average = (values: number[]) =>
		values.reduce((sum, value) => sum + value, 0) / values.length;

	return [...grouped.entries()].map(([key, { name, state, points }]) => ({
		id: `geonames-${key}`,
		kind: 'City',
		name,
		state,
		label: `${name}, ${state}`,
		latitude: average(points.map(([latitude]) => latitude)),
		longitude: average(points.map(([, longitude]) => longitude)),
		landAreaSqMi: 0,
	}));
}

function toExtraZips(knownZips: Set<string>): Prisma.PlaceCreateManyInput[] {
	const text = readFileSync(join(DATA_DIR, 'US.txt'), 'utf8');
	const extra = new Map<string, Prisma.PlaceCreateManyInput>();

	for (const line of text.split(/\r?\n/)) {
		const cells = line.split('\t');
		const zip = cells[1]?.trim() ?? '';
		const latitude = Number(cells[9]);
		const longitude = Number(cells[10]);
		if (!/^\d{5}$/.test(zip) || knownZips.has(zip) || extra.has(zip)) continue;
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

		extra.set(zip, {
			id: `zip-${zip}`,
			kind: 'Zip',
			name: zip,
			zip,
			label: zip,
			latitude,
			longitude,
			landAreaSqMi: 0,
		});
	}

	return [...extra.values()];
}

async function main() {
	const { prisma } = await import('../src/lib/prisma');
	const { resolveCoordinates } = await import('../src/services/placeService');
	const { syncAdditionalPlaces } = await import(
		'../src/services/teamLocationService'
	);

	const censusCities = toCities();
	const extraCities = toExtraCities(censusCities);
	const zips = toZips();
	const extraZips = toExtraZips(new Set(zips.map((zip) => zip.zip ?? '')));
	const places = [...censusCities, ...extraCities, ...zips, ...extraZips];
	console.log(`Adding ${extraCities.length} cities the Census file lacks (from GeoNames)`);
	console.log(`Adding ${extraZips.length} ZIPs the Census file lacks (from GeoNames)`);
	await prisma.place.deleteMany();
	for (let start = 0; start < places.length; start += BATCH_SIZE) {
		await prisma.place.createMany({
			data: places.slice(start, start + BATCH_SIZE),
		});
	}
	console.log(`Imported ${places.length} places`);

	const teams = await prisma.team.findMany({
		where: { latitude: null },
		select: { id: true, location: true },
	});
	let located = 0;
	for (const team of teams) {
		const coordinates = await resolveCoordinates(team.location);
		if (!coordinates) continue;
		await prisma.team.update({ where: { id: team.id }, data: coordinates });
		located += 1;
	}
	console.log(`Set coordinates on ${located} of ${teams.length} teams without them`);

	const withExtras = await prisma.team.findMany({
		where: { additionalLocations: { isEmpty: false } },
		select: { id: true, additionalLocations: true },
	});
	for (const team of withExtras) {
		await syncAdditionalPlaces(team.id, team.additionalLocations);
	}
	console.log(`Saved additional locations for ${withExtras.length} teams`);

	await prisma.$disconnect();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
