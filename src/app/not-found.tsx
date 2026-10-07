import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './notFound.module.scss';

export const metadata: Metadata = {
	title: 'Page not found',
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<p className={styles.code}>404</p>
				<h1>We couldn&rsquo;t find that page.</h1>
				<p className={styles.copy}>
					The link may be out of date, or the page may have moved.
				</p>
				<div className={styles.links}>
					<Link href='/search' className={styles.link}>
						&larr; Search groups
					</Link>
					<Link href='/' className={styles.link}>
						Go to the homepage
					</Link>
				</div>
			</div>
		</div>
	);
}
