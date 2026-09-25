import type { Prisma } from '../../generated/prisma/client';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { DEFAULT_RADIUS_MILES, TEAMS_PAGE_SIZE } from '@/lib/searchParams';
import { bikeTypeToDb, clubTypeToDb, disciplineToDb } from '@/lib/teamEnums';
import type { SearchParams, Team } from '@/lib/types';
import {
	resolveSearchLocation,
	type SearchLocation,
} from '@/services/placeService';

export interface TeamSearchPage {
	teams: Team[];
	total: number;
	page: number;
	pageCount: number;
}

type PointLocation = Extract<SearchLocation, { kind: 'point' }>;

const MILES_PER_DEGREE_LATITUDE = 69;
const EARTH_RADIUS_MILES = 3958.8;

function locationClause(
	location: string,
	resolved: SearchLocation | null,
): Prisma.TeamWhereInput | null {
	if (resolved?.kind === 'point') return null;

	if (resolved?.kind === 'state') {
		return {
			OR: [
				{ location: { endsWith: `, ${resolved.abbr}` } },
				{ location: { equals: resolved.name, mode: 'insensitive' } },
				{ additionalPlaces: { some: { state: resolved.abbr } } },
			],
		};
	}

	return {
		OR: [
			{ location: { contains: location, mode: 'insensitive' } },
			{ additionalLocations: { has: location } },
		],
	};
}

function buildWhere(
	params: SearchParams,
	resolved: SearchLocation | null,
): Prisma.TeamWhereInput {
	const q = params.q?.trim() ?? '';
	const location = params.location?.trim() ?? '';
	const and: Prisma.TeamWhereInput[] = [{ status: 'Approved' }];

	if (q) {
		and.push({
			OR: [
				{ name: { contains: q, mode: 'insensitive' } },
				{ missionStatement: { contains: q, mode: 'insensitive' } },
				{ tags: { has: q.toLowerCase() } },
			],
		});
	}

	const locationFilter = location ? locationClause(location, resolved) : null;
	if (locationFilter) and.push(locationFilter);

	if (params.type) and.push({ type: clubTypeToDb[params.type] });
	if (params.bikeTypes?.length) {
		and.push({ bikeType: { in: params.bikeTypes.map((b) => bikeTypeToDb[b]) } });
	}
	if (params.discipline) and.push({ discipline: disciplineToDb[params.discipline] });
	if (params.skillLevel) and.push({ skillLevels: { has: params.skillLevel } });
	if (params.competitiveOrCasual) {
		and.push({ competitiveOrCasual: params.competitiveOrCasual });
	}
	if (params.womensOnly) and.push({ personaRestrictions: { has: 'Women Only' } });
	if (params.youthOnly) and.push({ type: 'YouthProgram' });
	if (params.acceptingNewRiders) {
		and.push({
			waitlist: false,
			OR: [
				{ memberLimit: null },
				{ memberCount: { lt: prisma.team.fields.memberLimit } },
			],
		});
	}

	return { AND: and };
}

function pageBounds(total: number, requestedPage: number) {
	const pageCount = Math.max(1, Math.ceil(total / TEAMS_PAGE_SIZE));
	const page = Math.min(Math.max(1, requestedPage), pageCount);
	return { page, pageCount, skip: (page - 1) * TEAMS_PAGE_SIZE };
}

async function findTeamMilesWithin(
	point: PointLocation,
	radius: number,
): Promise<Map<string, number>> {
	const latDelta = radius / MILES_PER_DEGREE_LATITUDE;
	const lngDelta =
		radius /
		(MILES_PER_DEGREE_LATITUDE *
			Math.max(Math.cos((point.latitude * Math.PI) / 180), 0.01));

	const rows = await prisma.$queryRaw<{ id: string; miles: number }[]>`
		SELECT id, MIN(miles) AS miles FROM (
			SELECT t.id AS id, ${EARTH_RADIUS_MILES}::float8 * 2 * asin(sqrt(least(1,
				power(sin(radians(t.latitude - ${point.latitude}::float8) / 2), 2) +
				cos(radians(${point.latitude}::float8)) * cos(radians(t.latitude)) *
				power(sin(radians(t.longitude - ${point.longitude}::float8) / 2), 2)
			))) AS miles
			FROM "Team" t
			WHERE t.status = 'Approved'::"ReviewStatus"
				AND t.latitude BETWEEN ${point.latitude - latDelta}::float8 AND ${point.latitude + latDelta}::float8
				AND t.longitude BETWEEN ${point.longitude - lngDelta}::float8 AND ${point.longitude + lngDelta}::float8
			UNION ALL
			SELECT t.id AS id, ${EARTH_RADIUS_MILES}::float8 * 2 * asin(sqrt(least(1,
				power(sin(radians(tl.latitude - ${point.latitude}::float8) / 2), 2) +
				cos(radians(${point.latitude}::float8)) * cos(radians(tl.latitude)) *
				power(sin(radians(tl.longitude - ${point.longitude}::float8) / 2), 2)
			))) AS miles
			FROM "TeamLocation" tl
			JOIN "Team" t ON t.id = tl."teamId"
			WHERE t.status = 'Approved'::"ReviewStatus"
				AND tl.latitude BETWEEN ${point.latitude - latDelta}::float8 AND ${point.latitude + latDelta}::float8
				AND tl.longitude BETWEEN ${point.longitude - lngDelta}::float8 AND ${point.longitude + lngDelta}::float8
		) AS distances
		GROUP BY id
		HAVING MIN(miles) <= ${radius}::float8
	`;

	return new Map(rows.map((row) => [row.id, row.miles]));
}

async function searchNear(
	where: Prisma.TeamWhereInput,
	point: PointLocation,
	radius: number,
	requestedPage: number,
): Promise<TeamSearchPage> {
	const miles = await findTeamMilesWithin(point, radius);

	const matches = await prisma.team.findMany({
		where: { AND: [where, { id: { in: [...miles.keys()] } }] },
		select: { id: true, name: true },
	});
	matches.sort(
		(a, b) =>
			(miles.get(a.id) ?? 0) - (miles.get(b.id) ?? 0) ||
			a.name.localeCompare(b.name),
	);

	const { page, pageCount, skip } = pageBounds(matches.length, requestedPage);
	const pageIds = matches.slice(skip, skip + TEAMS_PAGE_SIZE).map((m) => m.id);
	const rows = await prisma.team.findMany({ where: { id: { in: pageIds } } });
	const rowsById = new Map(rows.map((row) => [row.id, row]));

	const teams = pageIds.flatMap((id) => {
		const row = rowsById.get(id);
		if (!row) return [];
		return [toTeam(row)];
	});

	return { teams, total: matches.length, page, pageCount };
}

export async function searchApprovedTeams(
	params: SearchParams,
	requestedPage: number,
): Promise<TeamSearchPage> {
	const location = params.location?.trim() ?? '';
	const resolved = location ? await resolveSearchLocation(location) : null;
	const where = buildWhere(params, resolved);

	if (resolved?.kind === 'point') {
		return searchNear(
			where,
			resolved,
			params.radius ?? DEFAULT_RADIUS_MILES,
			requestedPage,
		);
	}

	const total = await prisma.team.count({ where });
	const { page, pageCount, skip } = pageBounds(total, requestedPage);

	const rows = await prisma.team.findMany({
		where,
		orderBy: [{ name: 'asc' }, { id: 'asc' }],
		skip,
		take: TEAMS_PAGE_SIZE,
	});

	return { teams: rows.map(toTeam), total, page, pageCount };
}
