import Link from 'next/link';
import styles from './footer.module.scss';

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.wrap}>
				<p className={styles.contactLink}>
					&copy; {new Date().getFullYear()} Spoke &amp; Circle &middot;{' '}
					<Link href='/about'>About</Link> &middot;{' '}
					<Link href='/contact'>Contact us</Link> &middot;{' '}
					<Link href='/privacy'>Privacy Policy</Link> &middot;{' '}
					<Link href='/terms'>Terms of Service</Link>
				</p>
				<p className={styles.credit}>Built by cyclists, for cyclists.</p>
				<p className={styles.credit}>
					Location data from the US Census Bureau and{' '}
					<a href='https://www.geonames.org' rel='noopener noreferrer'>
						GeoNames
					</a>{' '}
					(
					<a
						href='https://creativecommons.org/licenses/by/4.0/'
						rel='noopener noreferrer'
					>
						CC BY 4.0
					</a>
					).
				</p>
			</div>
		</footer>
	);
}
