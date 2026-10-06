'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { claimSchema } from '@/lib/claimValidation';
import { teamAPI } from '@/services/api';
import styles from './claimTeamButton.module.scss';

interface ClaimTeamButtonProps {
	teamId: string;
	teamName: string;
	isSignedIn: boolean;
	hasPendingClaim: boolean;
}

export function ClaimTeamButton({
	teamId,
	teamName,
	isSignedIn,
	hasPendingClaim,
}: ClaimTeamButtonProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const messageId = useId();
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	function close() {
		if (isSubmitting) return;
		setOpen(false);
		setError(null);
	}

	async function submit() {
		if (isSubmitting) return;

		const parsed = claimSchema.safeParse({ message });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? 'Invalid message');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await teamAPI.claim(teamId, parsed.data.message);
			setSubmitted(true);
			setMessage('');
		} catch (submitError) {
			setError(describeSubmitError(submitError).join(' '));
		} finally {
			setIsSubmitting(false);
		}
	}

	const returnTo = encodeURIComponent(`/teams/${teamId}`);

	if (hasPendingClaim || submitted) {
		return (
			<span className={styles.pending} role='status'>
				Claim pending review
			</span>
		);
	}

	return (
		<>
			<button
				type='button'
				className={styles.trigger}
				onClick={() => setOpen(true)}
			>
				Claim this team
			</button>

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={titleId}
				onClose={close}
			>
				<h2 id={titleId} className={styles.title}>
					Claim &ldquo;{teamName}&rdquo;
				</h2>

				{isSignedIn ?
					<>
						<p className={styles.text}>
							Tell the admins why this group should be yours. Include anything
							that shows you run it, such as an official email address, a link
							to a page you manage, or your role on the team.
						</p>
						<label htmlFor={messageId} className={styles.label}>
							Message to admins
						</label>
						<textarea
							id={messageId}
							className={styles.textarea}
							rows={6}
							maxLength={2000}
							value={message}
							onChange={(event) => setMessage(event.target.value)}
						/>
						{error && (
							<p className={styles.error} role='alert'>
								{error}
							</p>
						)}
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.buttonOutline}
								disabled={isSubmitting}
								onClick={close}
							>
								Cancel
							</button>
							<button
								type='button'
								className={styles.buttonSolid}
								disabled={isSubmitting}
								onClick={submit}
							>
								{isSubmitting ? 'Sending…' : 'Submit claim'}
							</button>
						</div>
					</>
				:	<>
						<p className={styles.text}>
							You need a Spoke &amp; Circle account to claim a group. Sign up
							or log in, then come back to this page and click &ldquo;Claim this
							team&rdquo; again.
						</p>
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.buttonOutline}
								onClick={close}
							>
								Cancel
							</button>
							<a
								href={`/auth/login?returnTo=${returnTo}`}
								className={styles.buttonOutline}
							>
								Log in
							</a>
							<a
								href={`/auth/login?screen_hint=signup&returnTo=${returnTo}`}
								className={styles.buttonSolid}
							>
								Sign up
							</a>
						</div>
					</>
				}
			</dialog>
		</>
	);
}
