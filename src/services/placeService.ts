import { prisma } from '@/lib/prisma';
import type { LocationOption } from '@/lib/types';
import {
	findStateByAbbrOrName,
	findStateByName,
	US_STATES,
} from '@/lib/usStates';

const MAX_RESULTS = 8;
const CANDIDATE_LIMIT = 30;

export type SearchLocation =
	| { kind: 'point'; label: string; latitude: number; longitude: number }
	| { kind: 'state'; abbr: string; name: string };

function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function stateOptions(input: string): LocationOption[] {
	const needle = input.toLowerCase();
	return US_STATES.filter(
		(state) =>
			state.name.toLowerCase().startsWith(needle) ||
			state.abbr.toLowerCase() === needle,
	).map((state) => ({ placeId: `state-${state.abbr}`, label: state.name }));
}

export async function searchPlaces(
	input: string,
	options: { includeZip?: boolean } = {},
): Promise<LocationOption[]> {
	const query = input.trim();

	if (/^\d{2,5}$/.test(query)) {
		if (!options.includeZip) return [];
		const zips = await prisma.place.findMany({
			where: { kind: 'Zip', zip: { startsWith: query } },
			orderBy: { zip: 'asc' },
			take: MAX_RESULTS,
		});
		return zips.map((place) => ({ placeId: place.id, label: place.label }));
	}

	const [namePart = '', statePart] = query.split(',').map((part) => part.trim());
	const state = statePart ? findStateByAbbrOrName(statePart) : undefined;
	const prefix = `${escapeLike(namePart)}%`;

	const rows = await prisma.$queryRaw<{ id: string; label: string }[]>`
		SELECT id, label FROM "Place"
		WHERE kind = 'City'::"PlaceKind"
			AND (${state?.abbr ?? null}::text IS NULL OR state = ${state?.abbr ?? null}::text)
			AND (name ILIKE ${prefix} OR name % ${namePart})
		ORDER BY (name ILIKE ${prefix}) DESC, similarity(name, ${namePart}) DESC, "landAreaSqMi" DESC
		LIMIT ${CANDIDATE_LIMIT}
	`;

	const candidates: LocationOption[] = [
		...(statePart ? [] : stateOptions(query)),
		...rows.map((row) => ({ placeId: row.id, label: row.label })),
	];

	const seen = new Set<string>();
	const unique: LocationOption[] = [];
	for (const candidate of candidates) {
		if (seen.has(candidate.label)) continue;
		seen.add(candidate.label);
		unique.push(candidate);
	}

	return unique.slice(0, MAX_RESULTS);
}

async function findPlaceByLabel(label: string) {
	const trimmed = label.trim();
	if (/^\d{5}$/.test(trimmed)) {
		return prisma.place.findFirst({ where: { kind: 'Zip', zip: trimmed } });
	}
	return prisma.place.findFirst({
		where: { kind: 'City', label: { equals: trimmed, mode: 'insensitive' } },
		orderBy: { landAreaSqMi: 'desc' },
	});
}

export async function resolveCoordinates(
	label: string,
): Promise<{ latitude: number; longitude: number } | null> {
	const place = await findPlaceByLabel(label);
	return place ? { latitude: place.latitude, longitude: place.longitude } : null;
}

export async function resolveSearchLocation(
	label: string,
): Promise<SearchLocation | null> {
	const state = findStateByName(label);
	if (state) return { kind: 'state', abbr: state.abbr, name: state.name };

	const place = await findPlaceByLabel(label);
	if (!place) return null;
	return {
		kind: 'point',
		label: place.label,
		latitude: place.latitude,
		longitude: place.longitude,
	};
}
