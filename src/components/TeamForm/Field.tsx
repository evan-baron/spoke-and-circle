import type { ReactNode } from 'react';
import { RequiredMark } from './RequiredMark';
import styles from './teamForm.module.scss';

interface FieldProps {
	label: string;
	hint?: string;
	full?: boolean;
	required?: boolean;
	children: ReactNode;
}

export function Field({ label, hint, full, required, children }: FieldProps) {
	return (
		<label className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
			<span className={styles.fieldLabel}>
				{label}
				{required && <RequiredMark />}
			</span>
			{children}
			{hint && <span className={styles.fieldHint}>{hint}</span>}
		</label>
	);
}
