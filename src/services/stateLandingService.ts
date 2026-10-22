import { unstable_cache } from 'next/cache';
import { toTeam } from '@/lib/api/teamMapper';
import { clubType } from '@/lib/enums';
import { prisma } from '@/lib/prisma';
import { TEAMS_TAG } from '@/lib/teamCache';
import type { Team } from '@/lib/types';
import { US_STATES } from '@/lib/usStates';

export type LandingKind = 'teams' | 'rides';

const LANDING_CACHE_SECONDS = 3600;
const LANDING_LIST_CAP = 100;
const GROUP_RIDE_DB_TYPE = clubType.toDb['Group Ride'];

const typeClause = (kind: LandingKind) =>
	kind === 'rides' ?
		{ type: GROUP_RIDE_DB_TYPE }
	:	{ type: { not: GROUP_RIDE_DB_TYPE } };

export const getApprovedListingsInState = unstable_cache(
	async (abbr: string, kind: LandingKind): Promise<Team[]> => {
		const rows = await prisma.team.findMany({
			where: {
				status: 'Approved',
				...typeClause(kind),
				OR: [
					{ location: { endsWith: `, ${abbr}` } },
					{ additionalPlaces: { some: { state: abbr } } },
				],
			},
			orderBy: [{ name: 'asc' }, { id: 'asc' }],
			take: LANDING_LIST_CAP,
		});
		return rows.map(toTeam);
	},
	['state-landing-listings'],
	{ tags: [TEAMS_TAG], revalidate: LANDING_CACHE_SECONDS },
);

export const getStatesWithListings = unstable_cache(
	async (): Promise<Record<LandingKind, string[]>> => {
		const rows = await prisma.team.findMany({
			where: { status: 'Approved' },
			select: { location: true, type: true },
		});

		const found: Record<LandingKind, Set<string>> = {
			teams: new Set(),
			rides: new Set(),
		};
		for (const row of rows) {
			const abbr = row.location.split(',').pop()?.trim();
			if (!abbr || !US_STATES.some((state) => state.abbr === abbr)) continue;
			found[row.type === GROUP_RIDE_DB_TYPE ? 'rides' : 'teams'].add(abbr);
		}
		return { teams: [...found.teams], rides: [...found.rides] };
	},
	['states-with-listings'],
	{ tags: [TEAMS_TAG], revalidate: LANDING_CACHE_SECONDS },
);
