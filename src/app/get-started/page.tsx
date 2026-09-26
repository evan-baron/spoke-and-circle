import type { Metadata } from 'next';
import { GetStartedWizard } from '@/components/GetStartedWizard/GetStartedWizard';
import styles from './getStarted.module.scss';

export const metadata: Metadata = {
	title: 'Find Your Cycling Team or Group Ride',
	description:
		'Answer four quick questions about your ZIP code, riding discipline, and skill level, and we’ll point you to cycling teams, clubs, and group rides that fit.',
	alternates: { canonical: '/get-started' },
};

export default function GetStartedPage() {
	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<p className={styles.eyebrow}>Find your circle</p>
				<h1>Let&rsquo;s find your people.</h1>
				<GetStartedWizard />
			</div>
		</div>
	);
}
