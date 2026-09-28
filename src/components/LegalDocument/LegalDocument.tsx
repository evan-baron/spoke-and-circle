import styles from './legalDocument.module.scss';

interface LegalDocumentProps {
	title: string;
	effectiveDate: string;
	children: React.ReactNode;
}

export function LegalDocument({
	title,
	effectiveDate,
	children,
}: LegalDocumentProps) {
	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<p className={styles.eyebrow}>Legal</p>
				<h1>{title}</h1>
				<p className={styles.updated}>Effective {effectiveDate}</p>
				<div className={styles.prose}>{children}</div>
			</div>
		</div>
	);
}
