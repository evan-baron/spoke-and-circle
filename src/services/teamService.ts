import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import type { Team } from '@/lib/types';
import { clubType } from '@/lib/enums';
import { revalidateTeams, TEAMS_TAG, teamTag } from '@/lib/teamCache';
import { destroyTeamMedia, listTeamMediaIds } from '@/services/teamMediaService';

const TEAM_CACHE_SECONDS = 300;

class TeamNotFoundError extends Error {}

export const getApprovedTeamById = cache(
	async (id: string): Promise<Team | null> => {
		const load = unstable_cache(
			async (): Promise<Team> => {
				const row = await prisma.team.findFirst({
					where: { id, status: 'Approved' },
					include: { media: true },
				});
				if (!row) throw new TeamNotFoundError();
				return toTeam(row);
			},
			['approved-team', id],
			{ tags: [teamTag(id)], revalidate: TEAM_CACHE_SECONDS },
		);

		try {
			return await load();
		} catch (error) {
			if (error instanceof TeamNotFoundError) return null;
			throw error;
		}
	},
);

export const getApprovedGroupRides = cache(
	(parentId: string): Promise<Team[]> =>
		unstable_cache(
			async () => {
				const rows = await prisma.team.findMany({
					where: {
						affiliatedId: parentId,
						status: 'Approved',
						type: clubType.toDb['Group Ride'],
					},
					orderBy: { name: 'asc' },
				});
				return rows.map(toTeam);
			},
			['approved-group-rides', parentId],
			{ tags: [TEAMS_TAG], revalidate: TEAM_CACHE_SECONDS },
		)(),
);

export async function deleteGroupRide(
	teamId: string,
	user: { id: string; isAdmin: boolean },
): Promise<boolean> {
	const mediaIds = await listTeamMediaIds(teamId);
	const result = await prisma.team.deleteMany({
		where: {
			id: teamId,
			type: clubType.toDb['Group Ride'],
			...(user.isAdmin ? {} : { submittedById: user.id }),
		},
	});
	if (result.count > 0) {
		revalidateTeams(teamId);
		await destroyTeamMedia(mediaIds);
	}
	return result.count > 0;
}

export async function isApprovedTeamOwner(
	teamId: string,
	userId: string,
): Promise<boolean> {
	const count = await prisma.team.count({
		where: { id: teamId, status: 'Approved', submittedById: userId },
	});
	return count > 0;
}

export function countApprovedTeams(): Promise<number> {
	return prisma.team.count({ where: { status: 'Approved' } });
}

export function countPendingTeams(): Promise<number> {
	return prisma.team.count({ where: { status: 'Pending' } });
}
