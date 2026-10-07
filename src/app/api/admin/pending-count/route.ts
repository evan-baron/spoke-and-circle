import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import { countAdminNotifications } from '@/services/teamClaimService';

export const GET = withAuth(
	{ rateLimit: 'teams-read', role: 'admin' },
	async () => NextResponse.json({ count: await countAdminNotifications() }),
);
