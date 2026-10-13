import { useSyncExternalStore } from 'react';
import { PRIVACY_POLICY_VERSION } from '@/lib/siteConfig';

export type ConsentChoice = 'granted' | 'denied';
export type ConsentStatus = ConsentChoice | 'unset';

const STORAGE_KEY = 'cookie-consent';
const LEGACY_STORAGE_KEY = 'cookie-notice-dismissed';
const VISITOR_ID_KEY = 'cookie-consent-visitor';
const CHANGE_EVENT = 'cookie-consent-change';
const OPEN_SETTINGS_EVENT = 'cookie-settings-open';

let memoryChoice: ConsentChoice | null = null;
let memoryVisitorId: string | null = null;

function isChoice(value: string | null): value is ConsentChoice {
	return value === 'granted' || value === 'denied';
}

function readStoredChoice(): ConsentChoice | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (isChoice(stored)) return stored;
	} catch {
		return memoryChoice;
	}
	return memoryChoice;
}

function browserSignalsOptOut(): boolean {
	return (
		(navigator as Navigator & { globalPrivacyControl?: boolean })
			.globalPrivacyControl === true
	);
}

function getSnapshot(): ConsentStatus {
	const stored = readStoredChoice();
	if (stored) return stored;
	return browserSignalsOptOut() ? 'denied' : 'unset';
}

function subscribe(onChange: () => void) {
	window.addEventListener(CHANGE_EVENT, onChange);
	window.addEventListener('storage', onChange);
	return () => {
		window.removeEventListener(CHANGE_EVENT, onChange);
		window.removeEventListener('storage', onChange);
	};
}

export function useCookieConsent(): ConsentStatus | null {
	return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function getVisitorId(): string {
	try {
		const stored = localStorage.getItem(VISITOR_ID_KEY);
		if (stored) return stored;
		const created = crypto.randomUUID();
		localStorage.setItem(VISITOR_ID_KEY, created);
		return created;
	} catch {
		memoryVisitorId ??= crypto.randomUUID();
		return memoryVisitorId;
	}
}

function logConsentEvent(event: 'Granted' | 'Withdrawn') {
	try {
		void fetch('/api/consent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				visitorId: getVisitorId(),
				event,
				policyVersion: PRIVACY_POLICY_VERSION,
			}),
			keepalive: true,
		}).catch(() => undefined);
	} catch {
		return;
	}
}

export function setCookieConsent(choice: ConsentChoice) {
	const previous = readStoredChoice();
	memoryChoice = choice;
	try {
		localStorage.setItem(STORAGE_KEY, choice);
		localStorage.removeItem(LEGACY_STORAGE_KEY);
	} catch {
		memoryChoice = choice;
	}
	window.dispatchEvent(new Event(CHANGE_EVENT));

	if (choice === 'granted' && previous !== 'granted')
		logConsentEvent('Granted');
	if (choice === 'denied' && previous === 'granted') {
		logConsentEvent('Withdrawn');
	}
}

export function openCookieSettings() {
	window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function subscribeToOpenSettings(onOpen: () => void) {
	window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
	return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
}

export function clearAnalyticsCookies() {
	const hostname = window.location.hostname;
	const labels = hostname.split('.');
	const domains = new Set<string | null>([null, hostname]);
	if (labels.length > 2) domains.add(`.${labels.slice(-2).join('.')}`);
	else domains.add(`.${hostname}`);

	for (const entry of document.cookie.split(';')) {
		const name = entry.split('=')[0]?.trim();
		if (!name || !name.startsWith('_ga')) continue;
		for (const domain of domains) {
			const scope = domain ? `; domain=${domain}` : '';
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${scope}`;
		}
	}
}
