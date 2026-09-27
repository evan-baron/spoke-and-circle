import type { ReactNode } from 'react';
import styles from './teamForm.module.scss';

interface FieldProps {
	label: string;
	hint?: string;
	full?: boolean;
	children: ReactNode;
}

export function Field({ label, hint, full, children }: FieldProps) {
	return (
		<label className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
			<span className={styles.fieldLabel}>{label}</span>
			{children}
			{hint && <span className={styles.fieldHint}>{hint}</span>}
		</label>
	);
}
