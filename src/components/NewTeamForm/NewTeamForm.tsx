'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TeamForm } from '@/components/TeamForm/TeamForm';
import styles from '@/components/TeamForm/teamForm.module.scss';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import type { TeamFormValues } from '@/lib/types';
import { teamAPI } from '@/services/api';
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

interface NewTeamFormProps {
	initialValues?: TeamFormValues;
	canUploadMedia: boolean;
}

export function NewTeamForm({
	initialValues,
	canUploadMedia,
}: NewTeamFormProps) {
	const [submitted, setSubmitted] = useState(false);
	const [published, setPublished] = useState(false);
	const [publishedTeamId, setPublishedTeamId] = useState<string | null>(null);
	const [submittedRide, setSubmittedRide] = useState(false);
	const invalidatePendingCount = useInvalidatePendingTeamCount();

	const parentId = initialValues?.affiliatedId;
	const parentName = initialValues?.affiliation;

	if (submitted) {
		return (
			<div className={styles.page}>
				<div className={`${styles.wrap} ${styles.confirmation}`}>
					<div className={styles.confirmationCard}>
						<p className={styles.confirmationMark}>&#10003;</p>
						<h1>
							{published ?
								submittedRide ? 'Group ride published'
								:	'Team published'
							:	'Submission received'}
						</h1>
						<p>
							{published ?
								`Your ${submittedRide ? 'group ride' : 'team'} is live in the directory now. Admin submissions skip the review step.`
							:	'An admin will review this submission before it appears in search results. They may follow up with you if they have any questions.'}
						</p>
						<div className={styles.confirmationActions}>
							<Link
								href={parentId ? `/teams/${parentId}` : '/search'}
								className={styles.buttonOutline}
							>
								{parentName ? `Back to ${parentName}` : 'Back to search'}
							</Link>
							{published && publishedTeamId && (
								<Link
									href={`/teams/${publishedTeamId}`}
									className={styles.buttonOutline}
								>
									{submittedRide ? 'View group ride' : 'View team'}
								</Link>
							)}
							<button
								type='button'
								className={styles.buttonSolid}
								onClick={() => setSubmitted(false)}
							>
								{parentId ? 'Add another ride' : 'Submit another'}
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
				<Link
					href={parentId ? `/teams/${parentId}` : '/search'}
					className={styles.backLink}
				>
					<ArrowIcon direction='left' /> {parentName ? `Back to ${parentName}` : 'Back to search'}
				</Link>

				<header className={styles.header}>
					<p className={styles.eyebrow}>Submit a team, club, or group</p>
					<h1>
						{parentName ?
							'Submit a new group ride'
						:	'Submit a new team, club, or group ride'}
					</h1>
					<p>
						{parentName ?
							`We filled in what we could from ${parentName}. Name the ride, add its schedule and pace, then submit. Each ride is its own listing, so you can add more afterward.`
						:	'Send a team, club, or group ride for an admin to review. They may follow up with you before it goes live.'}
					</p>
				</header>

				<TeamForm
					mode='create'
					initialValues={initialValues}
					lockedToParent={!!parentId}
					canUploadMedia={canUploadMedia}
					onSubmit={async (payload) => {
						const result = await teamAPI.create(payload);
						if (!result.published) await invalidatePendingCount();
						setPublished(result.published);
						setPublishedTeamId(result.published ? result.team.id : null);
						setSubmittedRide(payload.type === 'Group Ride');
						setSubmitted(true);
					}}
				/>
			</div>
		</div>
	);
}
