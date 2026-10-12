import Link from 'next/link';
import { BackButton } from '@/components/BackButton/BackButton';
import { ClaimTeamButton } from '@/components/ClaimTeamButton/ClaimTeamButton';
import DeleteTeamButton from '@/components/DeleteTeamButton/DeleteTeamButton';
import { GroupRideDetail } from '@/components/GroupRideDetail/GroupRideDetail';
import { jsonLdScript } from '@/lib/jsonLd';
import styles from './team.module.scss';
import type { TeamViewProps } from './teamViewProps';

export function GroupRideView({
	team,
	structuredData,
	isSignedIn,
	isAdmin,
	canClaim,
	hasPendingClaim,
	editHref,
}: TeamViewProps) {
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
								isGroupRide
								isSignedIn={isSignedIn}
								hasPendingClaim={hasPendingClaim}
							/>
						</div>
					)}
					{editHref && (
						<div className={styles.topActions}>
							<Link href={editHref} className={styles.editLink}>
								Edit
							</Link>
							<DeleteTeamButton
								teamId={team.id}
								teamName={team.name}
								redirectTo={isAdmin ? '/admin/all' : '/dashboard'}
							/>
						</div>
					)}
				</div>

				<GroupRideDetail team={team} />
			</div>
		</div>
	);
}
