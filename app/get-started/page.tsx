import type { Metadata } from 'next';
import { GetStartedWizard } from '@/components/GetStartedWizard/GetStartedWizard';
import styles from './getStarted.module.scss';

export const metadata: Metadata = {
	title: 'Get Started | Spoke & Circle',
	description:
		'Tell us your ZIP code, riding discipline, skill level, and what you’re looking for so we can point you at the right team, club, or group ride.',
};

export default function GetStartedPage() {
	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<p className={styles.eyebrow}>Find your ride</p>
				<h1>Let&rsquo;s find your people.</h1>
				<GetStartedWizard />
			</div>
		</div>
	);
}
