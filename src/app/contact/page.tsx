import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm/ContactForm';
import Crank from '@/components/Graphics/Crank';
import styles from './contact.module.scss';

export const metadata: Metadata = {
	title: 'Contact Us',
	description:
		'Questions, feedback, or a cycling team or group ride we should know about? Send the Spoke & Circle team a message.',
	alternates: { canonical: '/contact' },
};

export default function ContactPage() {
	return (
		<>
			<section className={styles.hero}>
				<div className={styles.graphicContainer}>
					<div className={styles.graphic}>
						<Crank color='white' />
					</div>
				</div>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>Get in touch</p>
					<h1>Questions, feedback, or a group we should know about?</h1>
					<p className={styles.heroCopy}>
						Send us a note and we&rsquo;ll get back to you by email.
					</p>
				</div>
			</section>

			<div className={styles.formSection}>
				<ContactForm />
			</div>
		</>
	);
}
