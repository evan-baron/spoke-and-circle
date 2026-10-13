'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	setCookieConsent,
	subscribeToOpenSettings,
	useCookieConsent,
	type ConsentChoice,
} from '@/lib/cookieConsent';
import styles from './cookieNotice.module.scss';

export function CookieNotice() {
	const consent = useCookieConsent();
	const [reopened, setReopened] = useState(false);

	useEffect(() => subscribeToOpenSettings(() => setReopened(true)), []);

	if (consent === null) return null;
	if (consent !== 'unset' && !reopened) return null;

	function choose(choice: ConsentChoice) {
		setCookieConsent(choice);
		setReopened(false);
	}

	return (
		<section className={styles.notice} aria-label='Cookie settings'>
			<p>
				We use cookies that are necessary to keep you signed in. With your
				permission, we&rsquo;d also like to use optional cookies to understand
				how the site is used. See our{' '}
				<Link href='/privacy'>Privacy Policy</Link> for what we collect and how
				it&rsquo;s used.
			</p>
			<div className={styles.actions}>
				<button
					type='button'
					onClick={() => choose('denied')}
					className={styles.choice}
				>
					Necessary only
				</button>
				<button
					type='button'
					onClick={() => choose('granted')}
					className={styles.choice}
				>
					Accept all
				</button>
			</div>
		</section>
	);
}
