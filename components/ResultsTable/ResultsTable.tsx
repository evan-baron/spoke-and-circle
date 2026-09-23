import Link from 'next/link';
import { Badge } from '@/components/Badge/Badge';
import { formatMemberCount, formatVerification } from '@/lib/format';import { toneForPace, toneForVerified, toneForVisibility } from '@/lib/tone';
import type { Team } from '@/lib/types';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
	teams: Team[];
}

export function ResultsTable({ teams }: ResultsTableProps) {
	if (teams.length === 0) {
		return (
			<div className={styles.empty}>
				<p>No results match that search.</p>
				<p>Try a broader keyword or clear a filter.</p>
			</div>
		);
	}

	return (
		<>
			<ul className={styles.cardList}>
				{teams.map((team) => (
					<li key={team.id} className={styles.card}>
						<Link href={`/teams/${team.id}`} className={styles.cardLink}>
							<div className={styles.cardHeader}>
								<span className={styles.cardName}>{team.name}</span>
								<Badge tone='ink'>{team.type}</Badge>
							</div>
							<p className={styles.cardLocation}>{team.location}</p>
							<div className={styles.cardBadges}>
								<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
								<Badge tone={toneForVisibility(team.visibility)}>
									{team.visibility}
								</Badge>
								<span className={styles.cardMeta}>{team.bikeType}</span>
								<span className={styles.cardMeta}>{team.skillLevel}</span>
								<span className={styles.cardMeta}>
									{formatMemberCount(team.memberCount)}
								</span>
							</div>
							<p
								className={styles.cardVerification}
								data-verified={team.verified}
							>
								{formatVerification(team.verified, team.lastActiveYear)}
							</p>
						</Link>
					</li>
				))}
			</ul>

			<table className={styles.table}>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Location</th>
						<th>Bike type</th>
						<th>Skill level</th>
						<th>Pace</th>
						<th>Members</th>
						<th>Visibility</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{teams.map((team) => (
						<tr key={team.id}>
							<td>
								<Link href={`/teams/${team.id}`} className={styles.rowLink}>
									{team.name}
								</Link>
							</td>
							<td>
								<Badge tone='ink'>{team.type}</Badge>
							</td>
							<td>{team.location}</td>
							<td>{team.bikeType}</td>
							<td>{team.skillLevel}</td>
							<td>
								<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
							</td>
							<td>{formatMemberCount(team.memberCount)}</td>
							<td>
								<Badge tone={toneForVisibility(team.visibility)}>
									{team.visibility}
								</Badge>
							</td>
							<td>
								<Badge tone={toneForVerified(team.verified)}>
									{team.verified ?
										`Verified · ${team.lastActiveYear}`
									:	`Unverified`}
								</Badge>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
