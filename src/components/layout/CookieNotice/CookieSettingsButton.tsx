'use client';

import { openCookieSettings } from '@/lib/cookieConsent';

interface CookieSettingsButtonProps {
	className?: string;
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
	return (
		<button type='button' onClick={openCookieSettings} className={className}>
			Cookie settings
		</button>
	);
}
