import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteUrl, OG_IMAGE_PATH, SITE_NAME } from '@/lib/siteConfig';
import { getCurrentUser } from '@/services/currentUserService';
import { getClaimState } from '@/services/teamClaimService';
import {
	getApprovedGroupRides,
	getApprovedTeamById,
	isApprovedTeamOwner,
} from '@/services/teamService';
import { GroupRideView } from './GroupRideView';
import { TeamView } from './TeamView';

interface TeamPageParams {
	teamId: string;
}

function bikeTypesLabel(bikeTypes: string[]): string {
	return bikeTypes.length > 1 ? 'Mixed' : (bikeTypes[0] ?? 'Mixed');
}

export async function generateMetadata({
	params,
}: {
	params: Promise<TeamPageParams>;
}): Promise<Metadata> {
	const { teamId } = await params;
	const team = await getApprovedTeamById(teamId);
	if (!team) {
		return { title: 'Team not found', robots: { index: false, follow: false } };
	}

	const title = `${team.name}: ${team.type} in ${team.location}`;
	const summary =
		team.missionStatement ??
		`${team.name} is a ${bikeTypesLabel(team.bikeTypes).toLowerCase()} ${team.type.toLowerCase()} based in ${team.location}. See how to join, when they ride, and how to get in touch.`;
	const description =
		summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;

	return {
		title,
		description,
		alternates: { canonical: `/teams/${team.id}` },
		openGraph: {
			title,
			description,
			url: `/teams/${team.id}`,
			siteName: SITE_NAME,
			images: [
				{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME },
			],
			locale: 'en_US',
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [OG_IMAGE_PATH],
		},
	};
}

export default async function TeamPage({
	params,
}: {
	params: Promise<TeamPageParams>;
}) {
	const { teamId } = await params;
	const [team, currentUser] = await Promise.all([
		getApprovedTeamById(teamId),
		getCurrentUser(),
	]);

	if (!team) {
		notFound();
	}

	const groupRides =
		team.type === 'Group Ride' ? [] : await getApprovedGroupRides(team.id);

	const isOwner =
		currentUser && !currentUser.isAdmin ?
			await isApprovedTeamOwner(team.id, currentUser.id)
		:	false;

	const claimState =
		currentUser?.isAdmin || isOwner ?
			null
		:	await getClaimState(team.id, currentUser?.id);
	const canClaim = claimState?.claimable === true;

	const editHref =
		currentUser?.isAdmin ? `/admin/teams/${team.id}/edit`
		: isOwner ? `/dashboard/teams/${team.id}/edit`
		: null;

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SportsOrganization',
		name: team.name,
		sport: 'Cycling',
		url: `${getSiteUrl()}/teams/${team.id}`,
		description: team.missionStatement,
		location: { '@type': 'Place', name: team.location },
		...(team.founded > 0 ? { foundingDate: String(team.founded) } : {}),
		...(team.website ? { sameAs: [team.website] } : {}),
	};

	const viewProps = {
		team,
		structuredData,
		isSignedIn: Boolean(currentUser),
		isAdmin: Boolean(currentUser?.isAdmin),
		canClaim,
		hasPendingClaim: claimState?.hasPendingClaim === true,
		editHref,
	};

	if (team.type === 'Group Ride') return <GroupRideView {...viewProps} />;

	return <TeamView {...viewProps} groupRides={groupRides} />;
}
