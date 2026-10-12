import Link from 'next/link';
import { BackButton } from '@/components/BackButton/BackButton';
import { ClaimTeamButton } from '@/components/ClaimTeamButton/ClaimTeamButton';
import { TeamDetail } from '@/components/TeamDetail/TeamDetail';
import { jsonLdScript } from '@/lib/jsonLd';
import type { Team } from '@/lib/types';
import styles from './team.module.scss';
import type { TeamViewProps } from './teamViewProps';

interface TeamPageViewProps extends TeamViewProps {
	groupRides: Team[];
}

export function TeamView({
	team,
	groupRides,
	structuredData,
	isSignedIn,
	canClaim,
	hasPendingClaim,
	editHref,
}: TeamPageViewProps) {
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
								isSignedIn={isSignedIn}
								hasPendingClaim={hasPendingClaim}
							/>
						</div>
					)}
					{editHref && (
						<div className={styles.topActions}>
							<Link
								href={`/teams/new?from=${team.id}`}
								className={styles.editLink}
							>
								Add a group ride
							</Link>
							<Link href={editHref} className={styles.editLink}>
								Edit
							</Link>
						</div>
					)}
				</div>

				<TeamDetail team={team} groupRides={groupRides} />
			</div>
		</div>
	);
}
