import type { Metadata } from 'next';
import { TeamPage, getTeamPageMetadata } from '@/components/team/TeamPage/TeamPage';

interface GroupRidePageParams {
	groupRideId: string;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<GroupRidePageParams>;
}): Promise<Metadata> {
	const { groupRideId } = await params;
	return getTeamPageMetadata(groupRideId);
}

export default async function GroupRideRoute({
	params,
}: {
	params: Promise<GroupRidePageParams>;
}) {
	const { groupRideId } = await params;
	return <TeamPage id={groupRideId} route='group-rides' />;
}
