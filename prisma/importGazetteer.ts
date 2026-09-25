import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Prisma } from '../generated/prisma/client';
import { cleanPlaceName, parseGazetteer } from '../lib/gazetteer';

if (process.env.NODE_ENV === 'production') {
	throw new Error('Refusing to import with NODE_ENV=production');
}

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
	const { prisma } = await import('../lib/prisma');
	const { resolveCoordinates } = await import('../services/placeService');

	const cities = toCities();
	const zips = toZips();
	const extraZips = toExtraZips(new Set(zips.map((zip) => zip.zip ?? '')));
	const places = [...cities, ...zips, ...extraZips];
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

	await prisma.$disconnect();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
