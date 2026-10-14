import { useId, type ReactNode } from 'react';
import styles from './teamForm.module.scss';

interface SectionProps {
	title: string;
	description?: string;
	children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
	const titleId = useId();

	return (
		<fieldset className={styles.section} aria-labelledby={titleId}>
			<h2 id={titleId} className={styles.sectionTitle}>
				{title}
			</h2>
			{description && (
				<p className={styles.sectionDescription}>{description}</p>
			)}
			<div className={styles.sectionGrid}>{children}</div>
		</fieldset>
	);
}
