import { Badge } from '@/components/Badge/Badge';
import { formatMemberCount, formatVerification } from '@/lib/format';
import { parseRouteLink } from '@/lib/routeLink';
import { toneForPace, toneForVerified } from '@/lib/tone';
import type { Team } from '@/lib/types';
import { GroupRideDetailDesktop } from './GroupRideDetailDesktop';
import { GroupRideDetailMobile } from './GroupRideDetailMobile';
import styles from './groupRideDetail.module.scss';

interface GroupRideDetailProps {
	team: Team;
	groupRides?: Team[];
	preview?: boolean;
	routePromptHref?: string;
}

export function GroupRideDetail({
	team,
	groupRides = [],
	preview = false,
	routePromptHref,
}: GroupRideDetailProps) {
	const parsedRouteLink = parseRouteLink(team.routeLink);

	return (
		<div className={`${styles.detail} ${preview ? styles.preview : ''}`}>
			<header className={styles.header}>
				<div className={styles.badgeRow}>
					<Badge tone='ink'>{team.type}</Badge>
					{team.type === 'Group Ride' && (
						<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
					)}
					{team.bikeTypes.map((bikeType) => (
						<Badge key={bikeType} tone='gold'>
							{bikeType}
						</Badge>
					))}
					{team.discipline && <Badge tone='gold'>{team.discipline}</Badge>}
					<Badge tone={toneForVerified(team.verified)}>
						{formatVerification(team.verified, team.lastActiveYear)}
					</Badge>
				</div>
				<h1>{team.name}</h1>
				<p className={styles.subline}>
					{team.location}
					{team.founded > 0 && <> &middot; Founded {team.founded}</>}
					{team.memberCount > 0 && (
						<> &middot; {formatMemberCount(team.memberCount)}</>
					)}
				</p>
				{team.missionStatement && (
					<p className={styles.mission}>
						&ldquo;{team.missionStatement}&rdquo;
					</p>
				)}
			</header>

			<div className={styles.mobileOnly}>
				<GroupRideDetailMobile team={team} parsedRouteLink={parsedRouteLink} />
			</div>

			<div className={styles.desktopOnly}>
				<GroupRideDetailDesktop
					team={team}
					groupRides={groupRides}
					preview={preview}
					parsedRouteLink={parsedRouteLink}
					routePromptHref={routePromptHref}
				/>
			</div>
		</div>
	);
}
