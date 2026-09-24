import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json500, withPublicRateLimit } from '@/lib/api';
import { toTeam } from '@/lib/api/teamMapper';

export const GET = withPublicRateLimit('teams-read', async () => {
	try {
		const teams = await prisma.team.findMany({
			where: { status: 'Approved' },
			orderBy: { name: 'asc' },
		});

		return NextResponse.json({ success: true, teams: teams.map(toTeam) });
	} catch (error) {
		console.error('Error fetching teams:', error);
		return json500('Failed to fetch teams');
	}
});
