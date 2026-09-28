import styles from './teamForm.module.scss';

interface SubmitActionsProps {
	mode: 'create' | 'review' | 'edit';
	isSubmitting: boolean;
	isAntiBotValid: boolean;
	confirmingReject: boolean;
	onConfirmReject: () => void;
	onCancelReject: () => void;
	onReject: () => void;
}

export function SubmitActions({
	mode,
	isSubmitting,
	isAntiBotValid,
	confirmingReject,
	onConfirmReject,
	onCancelReject,
	onReject,
}: SubmitActionsProps) {
	const isReview = mode === 'review';

	return (
		<div
			className={`${styles.submitRow} ${mode !== 'create' ? styles.submitRowReview : ''}`}
		>
			{isReview ?
				<>
					<button
						type='submit'
						className={styles.buttonSolid}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Working…' : 'Approve'}
					</button>
					{confirmingReject ?
						<>
							<button
								type='button'
								className={styles.buttonDanger}
								disabled={isSubmitting}
								onClick={onReject}
							>
								Yes, reject and delete
							</button>
							<button
								type='button'
								className={styles.buttonOutline}
								disabled={isSubmitting}
								onClick={onCancelReject}
							>
								Cancel
							</button>
						</>
					:	<button
							type='button'
							className={styles.buttonDanger}
							disabled={isSubmitting}
							onClick={onConfirmReject}
						>
							Reject
						</button>
					}
				</>
			: mode === 'edit' ?
				<button
					type='submit'
					className={styles.buttonSolid}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving…' : 'Save changes'}
				</button>
			:	<button
					type='submit'
					className={styles.buttonSolid}
					disabled={!isAntiBotValid || isSubmitting}
				>
					{isSubmitting ? 'Submitting…' : 'Submit for review'}
				</button>
			}
		</div>
	);
}
