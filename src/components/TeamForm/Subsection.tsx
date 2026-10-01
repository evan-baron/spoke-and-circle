import { useId, type ReactNode } from 'react';
import styles from './teamForm.module.scss';

interface SubsectionProps {
	title: string;
	children: ReactNode;
}

export function Subsection({ title, children }: SubsectionProps) {
	const titleId = useId();

	return (
		<div
			className={styles.subsection}
			role='group'
			aria-labelledby={titleId}
		>
			<h3 id={titleId} className={styles.subsectionTitle}>
				{title}
			</h3>
			<div className={styles.sectionGrid}>{children}</div>
		</div>
	);
}
