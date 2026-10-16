import type { Metadata } from 'next';
import { TeamPage, getTeamPageMetadata } from '@/components/team/TeamPage/TeamPage';

interface TeamPageParams {
	teamId: string;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<TeamPageParams>;
}): Promise<Metadata> {
	const { teamId } = await params;
	return getTeamPageMetadata(teamId);
}

export default async function TeamRoute({
	params,
}: {
	params: Promise<TeamPageParams>;
}) {
	const { teamId } = await params;
	return <TeamPage id={teamId} route='teams' />;
}
