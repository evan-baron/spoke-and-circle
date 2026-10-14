import styles from './teamForm.module.scss';

export function RequiredMark() {
	return (
		<span className={styles.requiredMark} aria-hidden='true'>
			*
		</span>
	);
}
