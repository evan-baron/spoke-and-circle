import { cache } from 'react';
import { toTeam } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import type { Team } from '@/lib/types';

export const getApprovedTeamById = cache(
	async (id: string): Promise<Team | null> => {
		const row = await prisma.team.findFirst({
			where: { id, status: 'Approved' },
		});
		return row ? toTeam(row) : null;
	},
);

export function countApprovedTeams(): Promise<number> {
	return prisma.team.count({ where: { status: 'Approved' } });
}
