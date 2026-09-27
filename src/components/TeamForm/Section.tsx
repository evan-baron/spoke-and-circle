import { useId, type ReactNode } from 'react';
import styles from './teamForm.module.scss';

interface SectionProps {
	title: string;
	description?: string;
	children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
	// A <legend> can't reliably carry this custom a heading treatment across
	// browsers, so the visible title is a real <h2> — same element
	// DetailSection uses on the team page — and the <fieldset> gets its
	// accessible name from aria-labelledby instead of relying on <legend>.
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
