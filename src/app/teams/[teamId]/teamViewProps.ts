import type { Team } from '@/lib/types';

export interface TeamViewProps {
	team: Team;
	structuredData: Record<string, unknown>;
	isSignedIn: boolean;
	isAdmin: boolean;
	canClaim: boolean;
	hasPendingClaim: boolean;
	editHref: string | null;
}
