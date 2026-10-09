declare global {
	interface Window {
		gtag?: (
			command: 'event',
			name: string,
			params?: Record<string, string | number>,
		) => void;
	}
}

export function trackEvent(
	name: string,
	params?: Record<string, string | number>,
) {
	if (typeof window === 'undefined') return;
	window.gtag?.('event', name, params);
}
