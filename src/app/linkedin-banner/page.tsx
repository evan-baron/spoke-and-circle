import type { Metadata } from 'next';
import styles from './banner.module.scss';

export const metadata: Metadata = {
	title: 'LinkedIn Banner',
	robots: { index: false, follow: false },
};

export default function LinkedInBannerPage() {
	return (
		<main className={styles.stage}>
			<p className={styles.hint}>
				1584 × 396. In Chrome: right-click the banner, Inspect, then
				Ctrl+Shift+P and run &quot;Capture node screenshot&quot;.
			</p>
			<div className={styles.banner} id="banner">
				<div className={styles.glowOne} />
				<div className={styles.glowTwo} />
				<div className={styles.glowThree} />
				<div className={styles.grid} />
				<div className={`${styles.slash} ${styles.slashOne}`} />
				<div className={`${styles.slash} ${styles.slashTwo}`} />
				<div className={`${styles.slash} ${styles.slashThree}`} />
				<div className={styles.edge} />
				<span className={`${styles.corner} ${styles.cornerTop}`} />
				<span className={`${styles.corner} ${styles.cornerBottom}`} />
				<div className={styles.content}>
					<p className={styles.eyebrow}>Evan Baron / Enterprise Account Executive</p>
					<h1 className={styles.tagline}>
						I close deals engineers
						<br />
						actually <span className={styles.mark}>sign off on.</span>
					</h1>
					<p className={styles.contact}>
						<span>egbaron@gmail.com</span>
						<span className={styles.divider} />
						<span>(303) 588-3117</span>
					</p>
				</div>
			</div>
		</main>
	);
}
