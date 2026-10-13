'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { clearAnalyticsCookies, useCookieConsent } from '@/lib/cookieConsent';

interface GoogleAnalyticsProps {
	measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
	const consent = useCookieConsent();
	const granted = consent === 'granted';

	useEffect(() => {
		if (consent === null) return;
		(window as unknown as Record<string, boolean>)[
			`ga-disable-${measurementId}`
		] = !granted;
		if (!granted) clearAnalyticsCookies();
	}, [consent, granted, measurementId]);

	if (!granted) return null;

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
				strategy='afterInteractive'
			/>
			<Script id='google-analytics' strategy='afterInteractive'>
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${measurementId}');
				`}
			</Script>
		</>
	);
}
