'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import { claimRejectionReasonSchema } from '@/lib/claimValidation';
import { adminAPI } from '@/services/api';
import styles from './claimReviewButtons.module.scss';

interface ClaimReviewButtonsProps {
	claimId: string;
	teamName: string;
}

export function ClaimReviewButtons({
	claimId,
	teamName,
}: ClaimReviewButtonsProps) {
	const router = useRouter();
	const invalidatePendingCount = useInvalidatePendingTeamCount();
	const reasonId = useId();
	const [busy, setBusy] = useState(false);
	const [rejecting, setRejecting] = useState(false);
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);

	async function finish(
		outcome: 'approved' | 'rejected',
		emailStatus: string | undefined,
	) {
		await invalidatePendingCount();
		router.replace(
			emailStatus && emailStatus !== 'sent' ?
				`/admin/claims?outcome=${outcome}&emailStatus=${encodeURIComponent(emailStatus)}`
			:	'/admin/claims',
		);
		router.refresh();
	}

	async function approve() {
		if (busy) return;
		if (!window.confirm(`Transfer ownership of "${teamName}" to this user?`)) {
			return;
		}

		setBusy(true);
		setError(null);

		try {
			const { emailStatus } = await adminAPI.reviewClaim(claimId, {
				action: 'approve',
			});
			await finish('approved', emailStatus);
		} catch (reviewError) {
			setError(describeSubmitError(reviewError).join(' '));
			setBusy(false);
		}
	}

	async function reject() {
		if (busy) return;

		const parsed = claimRejectionReasonSchema.safeParse(reason);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? 'Invalid reason');
			return;
		}

		setBusy(true);
		setError(null);

		try {
			const { emailStatus } = await adminAPI.reviewClaim(claimId, {
				action: 'reject',
				reason: parsed.data,
			});
			await finish('rejected', emailStatus);
		} catch (reviewError) {
			setError(describeSubmitError(reviewError).join(' '));
			setBusy(false);
		}
	}

	return (
		<div className={styles.wrap}>
			{rejecting ?
				<>
					<label htmlFor={reasonId} className={styles.label}>
						Reason for rejecting (sent to the user by email)
					</label>
					<textarea
						id={reasonId}
						className={styles.textarea}
						rows={4}
						maxLength={1000}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
					/>
					<div className={styles.buttons}>
						<button
							type='button'
							className={styles.buttonDanger}
							disabled={busy}
							onClick={reject}
						>
							{busy ? 'Rejecting…' : 'Reject and send email'}
						</button>
						<button
							type='button'
							className={styles.buttonOutline}
							disabled={busy}
							onClick={() => {
								setRejecting(false);
								setError(null);
							}}
						>
							Cancel
						</button>
					</div>
				</>
			:	<div className={styles.buttons}>
					<button
						type='button'
						className={styles.buttonSolid}
						disabled={busy}
						onClick={approve}
					>
						Approve
					</button>
					<button
						type='button'
						className={styles.buttonOutline}
						disabled={busy}
						onClick={() => setRejecting(true)}
					>
						Reject
					</button>
				</div>
			}
			{error && (
				<p className={styles.error} role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}
