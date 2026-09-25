'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TeamForm } from '@/components/TeamForm/TeamForm';
import styles from '@/components/TeamForm/teamForm.module.scss';
import { teamAPI } from '@/services/api';

export default function NewTeamPage() {
	const [submitted, setSubmitted] = useState(false);

	if (submitted) {
		return (
			<div className={styles.page}>
				<div className={`${styles.wrap} ${styles.confirmation}`}>
					<div className={styles.confirmationCard}>
						<p className={styles.confirmationMark}>&#10003;</p>
						<h1>Submission received</h1>
						<p>
							An admin will review this submission before it appears in search
							results. They may follow up with you if they have any questions.
						</p>
						<div className={styles.confirmationActions}>
							<Link href='/search' className={styles.buttonOutline}>
								Back to search
							</Link>
							<button
								type='button'
								className={styles.buttonSolid}
								onClick={() => setSubmitted(false)}
							>
								Submit another
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<Link href='/search' className={styles.backLink}>
					&larr; Back to search
				</Link>

				<header className={styles.header}>
					<p className={styles.eyebrow}>Submit a team, club, or group</p>
					<h1>Submit a new team, club, or group ride</h1>
					<p>
						Send a team, club, or group ride for an admin to review. They may
						follow up with you before it goes live.
					</p>
				</header>

				<TeamForm
					mode='create'
					onSubmit={async (payload) => {
						await teamAPI.create(payload);
						setSubmitted(true);
					}}
				/>
			</div>
		</div>
	);
}
