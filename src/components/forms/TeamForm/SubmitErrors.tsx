import styles from './teamForm.module.scss';

interface SubmitErrorsProps {
	errors: string[];
	isReview: boolean;
}

export function SubmitErrors({ errors, isReview }: SubmitErrorsProps) {
	if (errors.length === 0) return null;

	return (
		<div className={styles.submitError} role='alert'>
			<p>
				We couldn&rsquo;t {isReview ? 'save this team' : 'submit your team'}:
			</p>
			<ul>
				{errors.map((message) => (
					<li key={message}>{message}</li>
				))}
			</ul>
		</div>
	);
}
