import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import { countPendingTeams } from '@/services/teamService';

export const GET = withAuth(
	{ rateLimit: 'teams-read', role: 'admin' },
	async () => NextResponse.json({ count: await countPendingTeams() }),
);
