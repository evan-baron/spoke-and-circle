import { cache } from 'react';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { clubTypeToDb } from '@/lib/teamEnums';
import type { Team } from '@/lib/types';

export const getApprovedTeamById = cache(
	async (id: string): Promise<Team | null> => {
		const row = await prisma.team.findFirst({
			where: { id, status: 'Approved' },
		});
		return row ? toTeam(row) : null;
	},
);

export async function getApprovedGroupRides(parentId: string): Promise<Team[]> {
	const rows = await prisma.team.findMany({
		where: {
			affiliatedId: parentId,
			status: 'Approved',
			type: clubTypeToDb['Group Ride'],
		},
		orderBy: { name: 'asc' },
	});
	return rows.map(toTeam);
}

export async function deleteGroupRide(
	teamId: string,
	user: { id: number; isAdmin: boolean },
): Promise<boolean> {
	const result = await prisma.team.deleteMany({
		where: {
			id: teamId,
			type: clubTypeToDb['Group Ride'],
			...(user.isAdmin ? {} : { submittedById: user.id }),
		},
	});
	return result.count > 0;
}

export async function isApprovedTeamOwner(
	teamId: string,
	userId: number,
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
