import type { Prisma } from '@/generated/prisma/client';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { TEAMS_PAGE_SIZE } from '@/lib/searchParams';
import { bikeTypeToDb, clubTypeToDb, disciplineToDb } from '@/lib/teamEnums';
import type { SearchParams, Team } from '@/lib/types';

export interface TeamSearchPage {
	teams: Team[];
	total: number;
	page: number;
	pageCount: number;
}

function buildWhere(params: SearchParams): Prisma.TeamWhereInput {
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

	if (location) {
		and.push({
			OR: [
				{ location: { contains: location, mode: 'insensitive' } },
				{ additionalLocations: { has: location } },
			],
		});
	}

	if (params.type) and.push({ type: clubTypeToDb[params.type] });
	if (params.bikeTypes?.length) {
		and.push({ bikeType: { in: params.bikeTypes.map((b) => bikeTypeToDb[b]) } });
	}
	if (params.discipline) and.push({ discipline: disciplineToDb[params.discipline] });
	if (params.skillLevel) and.push({ skillLevel: params.skillLevel });
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

export async function searchApprovedTeams(
	params: SearchParams,
	requestedPage: number,
): Promise<TeamSearchPage> {
	const where = buildWhere(params);
	const total = await prisma.team.count({ where });
	const pageCount = Math.max(1, Math.ceil(total / TEAMS_PAGE_SIZE));
	const page = Math.min(Math.max(1, requestedPage), pageCount);

	const rows = await prisma.team.findMany({
		where,
		orderBy: [{ name: 'asc' }, { id: 'asc' }],
		skip: (page - 1) * TEAMS_PAGE_SIZE,
		take: TEAMS_PAGE_SIZE,
	});

	return { teams: rows.map(toTeam), total, page, pageCount };
}
