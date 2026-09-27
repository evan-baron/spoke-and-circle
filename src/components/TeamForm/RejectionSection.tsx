import { Field } from './Field';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface RejectionSectionProps {
	submitter: { name: string; email: string } | null | undefined;
	rejectionReason: string;
	onRejectionReasonChange: (reason: string) => void;
}

export function RejectionSection({
	submitter,
	rejectionReason,
	onRejectionReasonChange,
}: RejectionSectionProps) {
	return (
		<div className={styles.rejectReason}>
			{submitter ?
				<Section title='Submission Rejection'>
					<Field
						label='Rejection reason'
						hint={`If you reject this team, ${submitter.name} (${submitter.email}) will be emailed this reason. The reason is optional.`}
						full
					>
						<textarea
							rows={3}
							maxLength={1000}
							value={rejectionReason}
							onChange={(event) => onRejectionReasonChange(event.target.value)}
							placeholder='Tell the submitter why this was rejected'
							className={styles.input}
						/>
					</Field>
				</Section>
			:	<span className={styles.fieldHint}>
					This team was submitted anonymously, so there is no one to email if
					you reject it.
				</span>
			}
		</div>
	);
}
