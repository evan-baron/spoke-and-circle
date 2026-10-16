import { Prisma } from '../../generated/prisma/client';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { inSeason } from '@/lib/rideSchedule';
import { DEFAULT_RADIUS_MILES, TEAMS_PAGE_SIZE } from '@/lib/searchParams';
import {
	bikeType,
	clubType,
	competitiveOrCasual,
	dropPolicy,
	format,
	mtbDiscipline,
	pace,
	racingDiscipline,
	skillLevel,
	virtualPlatform,
} from '@/lib/enums';
import type {
	CalendarRide,
	CalendarRidesResult,
	Ride,
	SearchParams,
	Team,
	TeamListPage,
	TeamOption,
} from '@/lib/types';
import {
	resolveSearchLocation,
	type SearchLocation,
} from '@/services/placeService';

const AFFILIATABLE_TYPES = Object.entries(clubType.toDb)
	.filter(([label]) => label !== 'Group Ride')
	.map(([, dbValue]) => dbValue);

export async function searchAffiliatableTeams(
	query: string,
	excludeId?: string,
): Promise<TeamOption[]> {
	const rows = await prisma.team.findMany({
		where: {
			status: 'Approved',
			type: { in: AFFILIATABLE_TYPES },
			name: { contains: query, mode: 'insensitive' },
			...(excludeId ? { id: { not: excludeId } } : {}),
		},
		select: { id: true, name: true, location: true },
		orderBy: { name: 'asc' },
		take: 10,
	});

	return rows.map((row) => ({
		id: row.id,
		label: row.name,
		location: row.location,
	}));
}

export type TeamSearchPage = TeamListPage;

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

const normalizeTerm = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
		.replace(/s$/, '');

function enumTerms<Label extends string, Db extends string>(
	registry: { toDb: Record<Label, Db> },
	clause: (value: Db) => Prisma.TeamWhereInput,
): [string, Prisma.TeamWhereInput][] {
	return (Object.entries(registry.toDb) as [string, Db][]).map(
		([label, value]) => [label, clause(value)],
	);
}

const ENUM_TERM_CLAUSES: [string, Prisma.TeamWhereInput][] = [
	...enumTerms(clubType, (value) => ({ type: value })),
	...enumTerms(bikeType, (value) => ({ bikeTypes: { has: value } })),
	...(
		[
			['women', 'Women Only'],
			['men', 'Men Only'],
			['lgbt', 'LGBTQ+ Only'],
			['lgbtq', 'LGBTQ+ Only'],
			['lgbtqia', 'LGBTQ+ Only'],
			['bipoc', 'BIPOC'],
		] as const
	).map(
		([term, persona]): [string, Prisma.TeamWhereInput] => [
			term,
			{ personaRestrictions: { has: persona } },
		],
	),
	...enumTerms(racingDiscipline, (value) => ({
		racingDisciplines: { has: value },
	})),
	...enumTerms(format, (value) => ({ format: value })),
	...enumTerms(mtbDiscipline, (value) => ({ discipline: value })),
	...enumTerms(dropPolicy, (value) => ({ dropPolicy: value })),
	...enumTerms(skillLevel, (value) => ({ skillLevels: { has: value } })),
	...enumTerms(pace, (value) => ({ pace: value })),
	...enumTerms(virtualPlatform, (value) => ({
		virtualPlatforms: { has: value },
	})).filter(([label]) => label !== 'Other'),
	...enumTerms(competitiveOrCasual, (value) => ({
		competitiveOrCasual: value,
	})),
	['Instructional', { instructional: true }],
	['Youth', { type: 'YouthProgram' }],
];


const FILLER_WORDS = new Set([
	'a',
	'an',
	'and',
	'club',
	'for',
	'group',
	'in',
	'of',
	'or',
	'ride',
	'rides',
	'team',
	'teams',
	'the',
	'to',
	'with',
]);

async function idsWithWordStartMatch(term: string): Promise<string[]> {
	const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = `(^|[^[:alnum:]])${escaped}`;
	const rows = await prisma.$queryRaw<{ id: string }[]>`
		SELECT id FROM "Team"
		WHERE status = 'Approved'::"ReviewStatus" AND "searchText" ~* ${pattern}
	`;
	return rows.map((row) => row.id);
}

async function termClause(term: string): Promise<Prisma.TeamWhereInput> {
	const normalized = normalizeTerm(term);
	const enumClauses = ENUM_TERM_CLAUSES.filter(
		([label]) => normalizeTerm(label) === normalized,
	).map(([, clause]) => clause);

	return {
		OR: [
			{ id: { in: await idsWithWordStartMatch(term) } },
			...enumClauses,
		],
	};
}

async function queryClause(q: string): Promise<Prisma.TeamWhereInput> {
	const allWords = q.split(/[\s\-,/]+/).filter((word) => word.length > 1);
	const wholePhrase = await termClause(q);
	if (allWords.length < 2) return wholePhrase;

	const words = allWords.filter((word) => !FILLER_WORDS.has(word.toLowerCase()));
	if (words.length === 0) return wholePhrase;

	const perWord = await Promise.all(words.map(termClause));
	return { OR: [wholePhrase, { AND: perWord }] };
}

async function buildWhere(
	params: SearchParams,
	resolved: SearchLocation | null,
): Promise<{ where: Prisma.TeamWhereInput; constrained: boolean }> {
	const q = params.q?.trim() ?? '';
	const location = params.location?.trim() ?? '';
	const and: Prisma.TeamWhereInput[] = [{ status: 'Approved' }];

	if (q) and.push(await queryClause(q));

	const locationFilter = location ? locationClause(location, resolved) : null;
	if (locationFilter) and.push(locationFilter);

	if (params.type) and.push({ type: clubType.toDb[params.type] });
	if (params.bikeTypes?.length) {
		and.push({
			bikeTypes: { hasSome: params.bikeTypes.map((b) => bikeType.toDb[b]) },
		});
	}
	if (params.discipline) and.push({ discipline: mtbDiscipline.toDb[params.discipline] });
	if (params.skillLevel) and.push({ skillLevels: { has: params.skillLevel } });
	if (params.racingDisciplines?.length) {
		and.push({
			racingDisciplines: {
				hasSome: params.racingDisciplines.map((rd) => racingDiscipline.toDb[rd]),
			},
		});
	}
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

	return { where: { AND: and }, constrained: and.length > 1 };
}

function pageBounds(total: number, requestedPage: number) {
	const pageCount = Math.max(1, Math.ceil(total / TEAMS_PAGE_SIZE));
	const page = Math.min(Math.max(1, requestedPage), pageCount);
	return { page, pageCount, skip: (page - 1) * TEAMS_PAGE_SIZE };
}

function nearbyTeams(point: PointLocation, radius: number): Prisma.Sql {
	const latDelta = radius / MILES_PER_DEGREE_LATITUDE;
	const lngDelta =
		radius /
		(MILES_PER_DEGREE_LATITUDE *
			Math.max(Math.cos((point.latitude * Math.PI) / 180), 0.01));

	return Prisma.sql`
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
}

async function findTeamMilesWithin(
	point: PointLocation,
	radius: number,
): Promise<Map<string, number>> {
	const rows = await prisma.$queryRaw<{ id: string; miles: number }[]>(
		nearbyTeams(point, radius),
	);

	return new Map(rows.map((row) => [row.id, row.miles]));
}

async function loadTeamsInOrder(ids: string[]): Promise<Team[]> {
	const rows = await prisma.team.findMany({ where: { id: { in: ids } } });
	const rowsById = new Map(rows.map((row) => [row.id, row]));

	return ids.flatMap((id) => {
		const row = rowsById.get(id);
		return row ? [toTeam(row)] : [];
	});
}

async function searchNearFiltered(
	where: Prisma.TeamWhereInput,
	point: PointLocation,
	radius: number,
	requestedPage: number,
	rankBySkill: boolean,
): Promise<TeamSearchPage> {
	const miles = await findTeamMilesWithin(point, radius);

	const matches = await prisma.team.findMany({
		where: { AND: [where, { id: { in: [...miles.keys()] } }] },
		select: { id: true, name: true, skillSpecificity: true },
	});
	matches.sort(
		(a, b) =>
			(rankBySkill ? a.skillSpecificity - b.skillSpecificity : 0) ||
			(miles.get(a.id) ?? 0) - (miles.get(b.id) ?? 0) ||
			a.name.localeCompare(b.name),
	);

	const { page, pageCount, skip } = pageBounds(matches.length, requestedPage);
	const pageIds = matches.slice(skip, skip + TEAMS_PAGE_SIZE).map((m) => m.id);

	return {
		teams: await loadTeamsInOrder(pageIds),
		total: matches.length,
		page,
		pageCount,
	};
}

async function nearbyPageIds(
	point: PointLocation,
	radius: number,
	rankBySkill: boolean,
	skip: number,
): Promise<{ id: string; total: number }[]> {
	const rows = await prisma.$queryRaw<{ id: string; total: bigint }[]>(
		Prisma.sql`
			SELECT t.id AS id, count(*) OVER () AS total
			FROM (${nearbyTeams(point, radius)}) n
			JOIN "Team" t ON t.id = n.id
			ORDER BY ${rankBySkill ? Prisma.sql`t."skillSpecificity" ASC,` : Prisma.empty}
				n.miles ASC, t.name ASC, t.id ASC
			LIMIT ${TEAMS_PAGE_SIZE} OFFSET ${skip}
		`,
	);

	return rows.map((row) => ({ id: row.id, total: Number(row.total) }));
}

async function countNearby(
	point: PointLocation,
	radius: number,
): Promise<number> {
	const rows = await prisma.$queryRaw<{ total: bigint }[]>(
		Prisma.sql`SELECT count(*) AS total FROM (${nearbyTeams(point, radius)}) n`,
	);

	return Number(rows[0]?.total ?? 0);
}

async function searchNearUnfiltered(
	point: PointLocation,
	radius: number,
	requestedPage: number,
	rankBySkill: boolean,
): Promise<TeamSearchPage> {
	const requestedSkip = (requestedPage - 1) * TEAMS_PAGE_SIZE;
	const rows = await nearbyPageIds(point, radius, rankBySkill, requestedSkip);
	if (rows.length > 0) {
		const total = rows[0]?.total ?? 0;
		const { page, pageCount } = pageBounds(total, requestedPage);
		return {
			teams: await loadTeamsInOrder(rows.map((row) => row.id)),
			total,
			page,
			pageCount,
		};
	}

	const total = requestedPage > 1 ? await countNearby(point, radius) : 0;
	const { page, pageCount, skip } = pageBounds(total, requestedPage);
	if (total === 0) return { teams: [], total, page, pageCount };

	const clamped = await nearbyPageIds(point, radius, rankBySkill, skip);
	return {
		teams: await loadTeamsInOrder(clamped.map((row) => row.id)),
		total,
		page,
		pageCount,
	};
}

export async function searchApprovedTeams(
	params: SearchParams,
	requestedPage: number,
): Promise<TeamSearchPage> {
	const location = params.location?.trim() ?? '';
	const resolved = location ? await resolveSearchLocation(location) : null;
	const { where, constrained } = await buildWhere(params, resolved);

	if (resolved?.kind === 'point') {
		const radius = params.radius ?? DEFAULT_RADIUS_MILES;
		const rankBySkill = Boolean(params.skillLevel);
		return constrained ?
				searchNearFiltered(where, resolved, radius, requestedPage, rankBySkill)
			:	searchNearUnfiltered(resolved, radius, requestedPage, rankBySkill);
	}

	const total = await prisma.team.count({ where });
	const { page, pageCount, skip } = pageBounds(total, requestedPage);

	const rows = await prisma.team.findMany({
		where,
		orderBy: [
			...(params.skillLevel ? [{ skillSpecificity: 'asc' as const }] : []),
			{ name: 'asc' },
			{ id: 'asc' },
		],
		skip,
		take: TEAMS_PAGE_SIZE,
	});

	return { teams: rows.map(toTeam), total, page, pageCount };
}

export const CALENDAR_RIDE_CAP = 500;

interface RideSeasonOptions {
	month: number;
	includeOffSeason: boolean;
}

function isRideInSeason(rides: unknown, month: number): boolean {
	const ride = Array.isArray(rides) ? (rides[0] as Ride | undefined) : undefined;
	return !ride || inSeason(ride, month);
}

export async function searchApprovedRides(
	params: SearchParams,
): Promise<CalendarRidesResult> {
	const location = params.location?.trim() ?? '';
	const resolved = location ? await resolveSearchLocation(location) : null;
	const { where } = await buildWhere(
		{ ...params, type: 'Group Ride' },
		resolved,
	);

	const scoped: Prisma.TeamWhereInput =
		resolved?.kind === 'point' ?
			{
				AND: [
					where,
					{
						id: {
							in: [
								...(
									await findTeamMilesWithin(
										resolved,
										params.radius ?? DEFAULT_RADIUS_MILES,
									)
								).keys(),
							],
						},
					},
				],
			}
		:	where;

	const [total, rows] = await Promise.all([
		prisma.team.count({ where: scoped }),
		prisma.team.findMany({
			where: scoped,
			orderBy: [{ name: 'asc' }, { id: 'asc' }],
			take: CALENDAR_RIDE_CAP,
		}),
	]);

	const rides = rows.flatMap((row): CalendarRide[] => {
		const team = toTeam(row);
		if (!team.ride) return [];
		return [
			{
				id: team.id,
				name: team.name,
				location: team.location,
				pace: team.pace,
				skillLevels: team.skillLevels,
				dropPolicy: team.dropPolicy,
				ride: team.ride,
				timeZone: team.timeZone,
			},
		];
	});

	return { rides, total, truncated: total > CALENDAR_RIDE_CAP };
}

export async function searchApprovedRideTeams(
	params: SearchParams,
	requestedPage: number,
	{ month, includeOffSeason }: RideSeasonOptions,
): Promise<TeamSearchPage & { offSeasonCount: number }> {
	const location = params.location?.trim() ?? '';
	const resolved = location ? await resolveSearchLocation(location) : null;
	const { where } = await buildWhere(
		{ ...params, type: 'Group Ride' },
		resolved,
	);

	const miles =
		resolved?.kind === 'point' ?
			await findTeamMilesWithin(
				resolved,
				params.radius ?? DEFAULT_RADIUS_MILES,
			)
		:	null;

	const rows = await prisma.team.findMany({
		where: miles ? { AND: [where, { id: { in: [...miles.keys()] } }] } : where,
		select: { id: true, name: true, skillSpecificity: true, rides: true },
		take: CALENDAR_RIDE_CAP,
	});

	const inSeasonRows = rows.filter((row) => isRideInSeason(row.rides, month));
	const matches = includeOffSeason ? rows : inSeasonRows;
	const rankBySkill = Boolean(params.skillLevel);

	matches.sort(
		(a, b) =>
			(rankBySkill ? a.skillSpecificity - b.skillSpecificity : 0) ||
			(miles ? (miles.get(a.id) ?? 0) - (miles.get(b.id) ?? 0) : 0) ||
			a.name.localeCompare(b.name) ||
			a.id.localeCompare(b.id),
	);

	const { page, pageCount, skip } = pageBounds(matches.length, requestedPage);
	const pageIds = matches.slice(skip, skip + TEAMS_PAGE_SIZE).map((m) => m.id);

	return {
		teams: await loadTeamsInOrder(pageIds),
		total: matches.length,
		page,
		pageCount,
		offSeasonCount: rows.length - inSeasonRows.length,
	};
}
