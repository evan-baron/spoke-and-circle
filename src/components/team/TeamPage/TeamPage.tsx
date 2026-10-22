import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton/BackButton';
import { ClaimTeamButton } from '@/components/team/ClaimTeamButton/ClaimTeamButton';
import DeleteTeamButton from '@/components/team/DeleteTeamButton/DeleteTeamButton';
import { GroupRideDetail } from '@/components/team/GroupRideDetail/GroupRideDetail';
import { TeamDetail } from '@/components/team/TeamDetail/TeamDetail';
import { jsonLdScript } from '@/lib/jsonLd';
import { OG_IMAGE_PATH, SITE_NAME } from '@/lib/siteConfig';
import { buildRideEventJsonLd, buildTeamJsonLd } from '@/lib/structuredData';
import { teamPath, teamRoute, type TeamRoute } from '@/lib/teamPaths';
import { getCurrentUser } from '@/services/currentUserService';
import { getClaimState } from '@/services/teamClaimService';
import {
	getApprovedGroupRides,
	getApprovedTeamById,
	isApprovedTeamOwner,
} from '@/services/teamService';
import styles from './teamPage.module.scss';

function bikeTypesLabel(bikeTypes: string[]): string {
	return bikeTypes.length > 1 ? 'Mixed' : (bikeTypes[0] ?? 'Mixed');
}

export async function getTeamPageMetadata(id: string): Promise<Metadata> {
	const team = await getApprovedTeamById(id);
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
		alternates: { canonical: teamPath(team) },
		openGraph: {
			title,
			description,
			url: teamPath(team),
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

export async function TeamPage({ id, route }: { id: string; route: TeamRoute }) {
	const [team, currentUser] = await Promise.all([
		getApprovedTeamById(id),
		getCurrentUser(),
	]);

	if (!team) {
		notFound();
	}

	if (teamRoute(team.type) !== route) {
		permanentRedirect(teamPath(team));
	}

	const groupRides =
		team.type === 'Group Ride' ?
			team.affiliatedId ?
				(await getApprovedGroupRides(team.affiliatedId)).filter(
					(ride) => ride.id !== team.id,
				)
			:	[]
		:	await getApprovedGroupRides(team.id);

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

	const canDeleteGroupRide =
		team.type === 'Group Ride' && (currentUser?.isAdmin || isOwner);

	const canAddGroupRide =
		team.type !== 'Group Ride' && (currentUser?.isAdmin || isOwner);

	const structuredData =
		team.type === 'Group Ride' ?
			buildRideEventJsonLd(team)
		:	buildTeamJsonLd(team);

	return (
		<div className={styles.page}>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
			/>
			<div className={styles.wrap}>
				<div className={styles.topRow}>
					<BackButton />
					{canClaim && (
						<div className={styles.topActions}>
							<ClaimTeamButton
								teamId={team.id}
								teamName={team.name}
								isSignedIn={Boolean(currentUser)}
								hasPendingClaim={claimState?.hasPendingClaim === true}
							/>
						</div>
					)}
					{editHref && (
						<div className={styles.topActions}>
							{canAddGroupRide && (
								<Link
									href={`/teams/new?from=${team.id}`}
									className={styles.editLink}
								>
									Add a group ride
								</Link>
							)}
							<Link href={editHref} className={styles.editLink}>
								Edit
							</Link>
							{canDeleteGroupRide && (
								<DeleteTeamButton
									teamId={team.id}
									teamName={team.name}
									redirectTo={
										currentUser?.isAdmin ? '/admin/all' : '/dashboard'
									}
								/>
							)}
						</div>
					)}
				</div>

				{team.type === 'Group Ride' ?
					<GroupRideDetail
						team={team}
						groupRides={groupRides}
						routePromptHref={editHref ?? undefined}
					/>
				:	<TeamDetail team={team} groupRides={groupRides} />}
			</div>
		</div>
	);
}
