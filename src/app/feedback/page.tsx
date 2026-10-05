import type { Metadata } from 'next';
import styles from '@/app/contact/contact.module.scss';
import { FeedbackForm } from '@/components/FeedbackForm/FeedbackForm';
import Crank from '@/components/Graphics/Crank';

export const metadata: Metadata = {
	title: 'Submit Feedback',
	description:
		'Found a bug or have an idea to make Spoke & Circle better? Send us your feedback.',
	alternates: { canonical: '/feedback' },
};

export default function FeedbackPage() {
	return (
		<>
			<section className={styles.hero}>
				<div className={styles.graphicContainer}>
					<div className={styles.graphic}>
						<Crank color='white' />
					</div>
				</div>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>Help us improve</p>
					<h1>Found a bug or have an idea?</h1>
					<p className={styles.heroCopy}>
						Tell us what went wrong or what would make Spoke &amp; Circle
						better, and we&rsquo;ll take a look.
					</p>
				</div>
			</section>

			<div className={styles.formSection}>
				<FeedbackForm />
			</div>
		</>
	);
}
