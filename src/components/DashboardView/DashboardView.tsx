'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { TeamForm } from '@/components/TeamForm/TeamForm';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import { teamAPI } from '@/services/api';
import styles from './dashboardView.module.scss';

type View = 'teams' | 'submit';

interface DashboardTeam {
	id: string;
	name: string;
	location: string;
	status: string;
}

interface DashboardViewProps {
	teams: DashboardTeam[];
}

const VIEWS: { id: View; label: string }[] = [
	{ id: 'teams', label: 'My Teams' },
	{ id: 'submit', label: 'Submit a Team' },
];

const STATUS_TONES: Record<string, BadgeTone> = {
	Approved: 'forest',
	Pending: 'gold',
	Rejected: 'rust',
};

const DashboardView = ({ teams }: DashboardViewProps) => {
	const router = useRouter();
	const invalidatePendingCount = useInvalidatePendingTeamCount();
	const [view, setView] = useState<View>('teams');
	const [submitted, setSubmitted] = useState(false);

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
							className={view === id ? styles.buttonSolid : styles.buttonOutline}
							onClick={() => selectView(id)}
						>
							{label}
						</button>
					))}
				</div>

				<div className={styles.panel} role='tabpanel'>
					{view === 'teams' &&
						(teams.length === 0 ?
							<div className={styles.empty}>
								<p>You haven&rsquo;t submitted any teams yet.</p>
							</div>
						:	<ul className={styles.teamList}>
								{teams.map((team) => (
									<li key={team.id} className={styles.teamRow}>
										<div className={styles.teamInfo}>
											<Link
												href={`/teams/${team.id}`}
												className={styles.teamName}
											>
												{team.name}
											</Link>
											<span className={styles.teamLocation}>
												{team.location}
											</span>
										</div>
										<div className={styles.teamActions}>
											<Badge tone={STATUS_TONES[team.status] ?? 'ink'}>
												{team.status}
											</Badge>
											{team.status === 'Approved' && (
												<Link
													href={`/dashboard/teams/${team.id}/edit`}
													className={styles.editLink}
												>
													Edit
												</Link>
											)}
										</div>
									</li>
								))}
							</ul>)}

					{view === 'submit' &&
						(submitted ?
							<div className={styles.confirmationCard}>
								<p className={styles.confirmationMark}>&#10003;</p>
								<h2>Submission received</h2>
								<p>
									An admin will review this submission before it appears in
									search results. They may follow up with you if they have any
									questions.
								</p>
								<div className={styles.confirmationActions}>
									<button
										type='button'
										className={styles.buttonOutline}
										onClick={() => selectView('teams')}
									>
										View my teams
									</button>
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
									await teamAPI.create(payload);
									await invalidatePendingCount();
									router.refresh();
									setSubmitted(true);
								}}
							/>)}
				</div>
			</div>
		</div>
	);
};

export default DashboardView;
