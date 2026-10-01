'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import DeleteTeamButton from '@/components/DeleteTeamButton/DeleteTeamButton';
import { TeamForm } from '@/components/TeamForm/TeamForm';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import { teamAPI } from '@/services/api';
import styles from './dashboardView.module.scss';

type View = 'teams' | 'rides' | 'submit';

interface DashboardTeam {
	id: string;
	name: string;
	location: string;
	status: string;
	type: string;
}

interface DashboardViewProps {
	teams: DashboardTeam[];
}

const VIEWS: { id: View; label: string }[] = [
	{ id: 'teams', label: 'My Teams' },
	{ id: 'rides', label: 'My Group Rides' },
	{ id: 'submit', label: 'Submit a Team or Group Ride' },
];

const STATUS_TONES: Record<string, BadgeTone> = {
	Approved: 'forest',
	Pending: 'gold',
	Rejected: 'rust',
};

interface TeamListProps {
	items: DashboardTeam[];
	emptyMessage: string;
}

const TeamList = ({ items, emptyMessage }: TeamListProps) => {
	if (items.length === 0) {
		return (
			<div className={styles.empty}>
				<p>{emptyMessage}</p>
			</div>
		);
	}

	return (
		<ul className={styles.teamList}>
			{items.map((team) => (
				<li key={team.id} className={styles.teamRow}>
					<div className={styles.teamInfo}>
						<Link href={`/teams/${team.id}`} className={styles.teamName}>
							{team.name}
						</Link>
						<span className={styles.teamLocation}>{team.location}</span>
					</div>
					<div className={styles.teamActions}>
						<Badge tone={STATUS_TONES[team.status] ?? 'ink'}>
							{team.status}
						</Badge>
						<div className={styles.teamButtons}>
							{team.status === 'Approved' && team.type !== 'Group Ride' && (
								<Link
									href={`/teams/new?from=${team.id}`}
									className={styles.editLink}
								>
									Add a group ride
								</Link>
							)}
							{team.status === 'Approved' && (
								<Link
									href={`/dashboard/teams/${team.id}/edit`}
									className={styles.editLink}
								>
									Edit
								</Link>
							)}
							{team.type === 'Group Ride' && (
								<DeleteTeamButton teamId={team.id} teamName={team.name} />
							)}
						</div>
					</div>
				</li>
			))}
		</ul>
	);
};

const DashboardView = ({ teams }: DashboardViewProps) => {
	const router = useRouter();
	const invalidatePendingCount = useInvalidatePendingTeamCount();
	const [view, setView] = useState<View>('teams');
	const [submitted, setSubmitted] = useState(false);
	const [published, setPublished] = useState(false);
	const [publishedTeamId, setPublishedTeamId] = useState<string | null>(null);
	const [submittedRide, setSubmittedRide] = useState(false);

	const groupRides = teams.filter((team) => team.type === 'Group Ride');
	const otherTeams = teams.filter((team) => team.type !== 'Group Ride');

	function selectView(next: View) {
		setView(next);
		if (next !== 'submit') setSubmitted(false);
	}

	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<header className={styles.header}>
					<h1>My Dashboard</h1>
				</header>

				<div className={styles.tabs} role='tablist'>
					{VIEWS.map(({ id, label }) => (
						<button
							key={id}
							type='button'
							role='tab'
							aria-selected={view === id}
							className={
								view === id ? styles.buttonSolid : styles.buttonOutline
							}
							onClick={() => selectView(id)}
						>
							{label}
						</button>
					))}
				</div>

				<div className={styles.panel} role='tabpanel'>
					{view === 'teams' && (
						<TeamList
							items={otherTeams}
							emptyMessage={`You haven't submitted any teams yet.`}
						/>
					)}

					{view === 'rides' && (
						<TeamList
							items={groupRides}
							emptyMessage={`You haven't submitted any group rides yet. Use "Add a group ride" on one of your teams, or submit one from the Submit a Team tab.`}
						/>
					)}

					{view === 'submit' &&
						(submitted ?
							<div className={styles.confirmationCard}>
								<p className={styles.confirmationMark}>&#10003;</p>
								<h2>{published ? 'Team published' : 'Submission received'}</h2>
								<p>
									{published ?
										'Your team is live in the directory now. Admin submissions skip the review step.'
									:	'An admin will review this submission before it appears in search results. They may follow up with you if they have any questions.'
									}
								</p>
								<div className={styles.confirmationActions}>
									<button
										type='button'
										className={styles.buttonOutline}
										onClick={() =>
											selectView(submittedRide ? 'rides' : 'teams')
										}
									>
										{submittedRide ? 'View my group rides' : 'View my teams'}
									</button>
									{published && publishedTeamId && (
										<Link
											href={`/teams/${publishedTeamId}`}
											className={styles.buttonOutline}
										>
											View team
										</Link>
									)}
									<button
										type='button'
										className={styles.buttonSolid}
										onClick={() => setSubmitted(false)}
									>
										Submit another
									</button>
								</div>
							</div>
						:	<TeamForm
								mode='create'
								onSubmit={async (payload) => {
									const result = await teamAPI.create(payload);
									if (!result.published) await invalidatePendingCount();
									router.refresh();
									setPublished(result.published);
									setPublishedTeamId(result.published ? result.team.id : null);
									setSubmittedRide(payload.type === 'Group Ride');
									setSubmitted(true);
								}}
							/>)}
				</div>
			</div>
		</div>
	);
};

export default DashboardView;
