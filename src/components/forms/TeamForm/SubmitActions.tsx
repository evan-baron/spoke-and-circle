import styles from './teamForm.module.scss';

interface SubmitActionsProps {
	isSubmitting: boolean;
	confirmingReject: boolean;
	onConfirmReject: () => void;
	onCancelReject: () => void;
	onReject: () => void;
}

export function SubmitActions({
	isSubmitting,
	confirmingReject,
	onConfirmReject,
	onCancelReject,
	onReject,
}: SubmitActionsProps) {
	return (
		<div className={`${styles.submitRow} ${styles.submitRowReview}`}>
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
		</div>
	);
}
