import type { Prisma } from '../../generated/prisma/client';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import type { Team } from '@/lib/types';
import { US_STATES } from '@/lib/usStates';

const APPROVED: Prisma.TeamWhereInput = { status: 'Approved' };

export interface RideStyleTile {
	label: string;
	description: string;
	href: string;
	where: Prisma.TeamWhereInput;
}

export const RIDE_STYLES: RideStyleTile[] = [
	{
		label: 'No-drop',
		description: 'Nobody gets left behind on the road.',
		href: '/search?q=no-drop',
		where: { dropPolicy: 'NoDrop' },
	},
	{
		label: 'Gravel',
		description: 'Dirt roads, mixed surfaces, long days out.',
		href: '/search?bikeType=Gravel',
		where: { bikeTypes: { has: 'Gravel' } },
	},
	{
		label: 'Beginner-friendly',
		description: 'Groups that welcome riders new to this.',
		href: '/search?skillLevel=Beginner',
		where: { skillLevels: { has: 'Beginner' } },
	},
	{
		label: 'Racing teams',
		description: 'Teams that train and race together.',
		href: '/search?type=Team&competitiveOrCasual=Competitive',
		where: { type: 'Team', competitiveOrCasual: 'Competitive' },
	},
	{
		label: 'Women only',
		description: 'Rides and teams run by and for women.',
		href: '/search?womensOnly=true',
		where: { personaRestrictions: { has: 'Women Only' } },
	},
	{
		label: 'Virtual',
		description: 'Zwift and trainer rides, from home.',
		href: '/search?q=virtual',
		where: { format: { in: ['Virtual', 'Hybrid'] } },
	},
];

export interface HomeStateCount {
	abbr: string;
	name: string;
	count: number;
}

export interface JoinCounts {
	open: number;
	tryouts: number;
	referral: number;
	inviteOnly: number;
}

export interface HomeData {
	total: number;
	rideStyleCounts: number[];
	states: HomeStateCount[];
	join: JoinCounts;
	recent: Team[];
}

const STATE_NAMES = new Map(US_STATES.map((state) => [state.abbr, state.name]));

async function countByState(limit: number): Promise<HomeStateCount[]> {
	const rows = await prisma.$queryRaw<{ abbr: string; count: bigint }[]>`
		SELECT substring("location" from ', ([A-Z]{2})$') AS abbr, COUNT(*) AS count
		FROM "Team"
		WHERE status = 'Approved'::"ReviewStatus"
		GROUP BY abbr
		HAVING substring("location" from ', ([A-Z]{2})$') IS NOT NULL
		ORDER BY count DESC, abbr ASC
	`;

	return rows
		.filter((row) => STATE_NAMES.has(row.abbr))
		.slice(0, limit)
		.map((row) => ({
			abbr: row.abbr,
			name: STATE_NAMES.get(row.abbr) ?? row.abbr,
			count: Number(row.count),
		}));
}

const countWhere = (where: Prisma.TeamWhereInput) =>
	prisma.team.count({ where: { AND: [APPROVED, where] } });

export async function getHomeData(): Promise<HomeData> {
	const [
		total,
		rideStyleCounts,
		states,
		open,
		tryouts,
		referral,
		inviteOnly,
		recentRows,
	] = await Promise.all([
		prisma.team.count({ where: APPROVED }),
		Promise.all(RIDE_STYLES.map((style) => countWhere(style.where))),
		countByState(8),
		countWhere({ joinOpen: true }),
		countWhere({ joinTryouts: true }),
		countWhere({ joinReferral: true }),
		countWhere({ joinInviteOnly: true }),
		prisma.team.findMany({
			where: APPROVED,
			orderBy: { createdAt: 'desc' },
			take: 6,
		}),
	]);

	return {
		total,
		rideStyleCounts,
		states,
		join: { open, tryouts, referral, inviteOnly },
		recent: recentRows.map(toTeam),
	};
}
