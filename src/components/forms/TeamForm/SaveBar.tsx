import Link from 'next/link';
import styles from './teamForm.module.scss';

interface SaveBarProps {
	isDirty: boolean;
	isSubmitting: boolean;
	cancelHref?: string;
}

export function SaveBar({ isDirty, isSubmitting, cancelHref }: SaveBarProps) {
	return (
		<div className={styles.saveBar}>
			<p className={styles.saveStatus} role='status'>
				{isDirty && (
					<>
						<span className={styles.saveDot} aria-hidden='true' />
						Unsaved changes
					</>
				)}
			</p>
			<div className={styles.saveActions}>
				{cancelHref && (
					<Link href={cancelHref} className={styles.buttonOutline}>
						Cancel
					</Link>
				)}
				<button
					type='submit'
					className={styles.buttonSolid}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving…' : 'Save changes'}
				</button>
			</div>
		</div>
	);
}
