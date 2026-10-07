import Link from 'next/link';
import { Badge } from '@/components/Badge/Badge';
import {
	formatMemberCount,
	formatSkillLevelLines,
	getTeamLocations,
	formatVerification,
} from '@/lib/format';
import {
	toneForCompetitiveOrCasual,
	toneForPace,
	toneForVerified,
} from '@/lib/tone';
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
							<p className={styles.cardLocation}>
								{getTeamLocations(team).join(', ')}
							</p>
							<div className={styles.cardBadges}>
								{team.type === 'Group Ride' ?
									<Badge tone={toneForPace(team.pace)}>{team.pace} pace</Badge>
								:	<Badge tone={toneForCompetitiveOrCasual(team.competitiveOrCasual)}>
										{team.competitiveOrCasual}
									</Badge>
								}
								{team.bikeTypes.map((bikeType) => (
									<Badge key={bikeType} tone='gold'>
										{bikeType}
									</Badge>
								))}
								{formatSkillLevelLines(team.skillLevels).map((level) => (
									<Badge key={level} tone='ink'>
										{level}
									</Badge>
								))}
								{/* <span className={styles.cardMeta}>
									{formatMemberCount(team.memberCount)}
								</span> */}
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
						<th>Group type</th>
						<th>Competitive or recreational</th>
						<th>Location(s)</th>
						<th>Cycling Disciplines</th>
						<th>Skill level</th>
						<th>Riding pace</th>
						{/* <th>Members</th> */}
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{teams.map((team) => (
						<tr key={team.id}>
							<td>
								<Link href={`/teams/${team.id}`} className={styles.rowLink}>
									<span className={styles.rowLinkText}>{team.name}</span>
								</Link>
							</td>
							<td>
								<Badge tone='ink'>{team.type}</Badge>
							</td>
							<td>
								{team.type !== 'Group Ride' && (
									<Badge
										tone={toneForCompetitiveOrCasual(team.competitiveOrCasual)}
									>
										{team.competitiveOrCasual}
									</Badge>
								)}
							</td>
							<td>
								{getTeamLocations(team).map((location, index, all) => (
									<span key={location} className={styles.stackedLine}>
										{location}
										{index < all.length - 1 && ','}
									</span>
								))}
							</td>
							<td>{team.bikeTypes.join(', ')}</td>
							<td>
								{formatSkillLevelLines(team.skillLevels).map(
									(level, index, all) => (
										<span key={level} className={styles.stackedLine}>
											{level}
											{index < all.length - 1 && ','}
										</span>
									),
								)}
							</td>
							<td>
								<Badge tone={toneForPace(team.pace)}>
									{team.pace}
								</Badge>
							</td>
							{/* <td>{team.memberCount}</td> */}
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
