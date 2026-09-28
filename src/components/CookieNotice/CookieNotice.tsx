'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './cookieNotice.module.scss';

const DISMISSED_KEY = 'cookie-notice-dismissed';

export function CookieNotice() {
	const [dismissed, setDismissed] = useState(true);

	useEffect(() => {
		try {
			setDismissed(localStorage.getItem(DISMISSED_KEY) === 'true');
		} catch {
			// localStorage unavailable (private browsing, etc.), keep hidden
		}
	}, []);

	function handleDismiss() {
		setDismissed(true);
		try {
			localStorage.setItem(DISMISSED_KEY, 'true');
		} catch {
			// localStorage unavailable, dismissal just won't persist
		}
	}

	if (dismissed) return null;

	return (
		<div className={styles.notice} role='status'>
			<p>
				We use cookies to keep you signed in and to measure site usage with
				Google Analytics. No advertising or cross-site tracking cookies. See
				our{' '}
				<Link href='/privacy'>Privacy Policy</Link> for details.
			</p>
			<button type='button' onClick={handleDismiss} className={styles.dismiss}>
				Got it
			</button>
		</div>
	);
}
