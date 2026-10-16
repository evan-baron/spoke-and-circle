import { stripInstagramHandle } from './instagram';

export interface DuplicateSignalFields {
	contactEmail: string | null;
	instagram: string | null;
	instagramLink: string | null;
	website: string | null;
	facebookLink: string | null;
}

export type DuplicateSignalKey =
	| 'email'
	| 'instagram'
	| 'website'
	| 'facebook';

export const DUPLICATE_SIGNAL_LABELS: Record<DuplicateSignalKey, string> = {
	email: 'Contact email',
	instagram: 'Instagram',
	website: 'Website',
	facebook: 'Facebook',
};

const SHARED_HOSTS = [
	'facebook.com',
	'fb.com',
	'instagram.com',
	'strava.com',
	'linktr.ee',
	'linkin.bio',
	'bio.link',
	'beacons.ai',
	'sites.google.com',
	'wixsite.com',
	'square.site',
	'squarespace.com',
	'godaddysites.com',
	'weebly.com',
	'wordpress.com',
	'blogspot.com',
	'carrd.co',
	'notion.site',
	'webflow.io',
	'wixstudio.io',
	'github.io',
	'netlify.app',
	'vercel.app',
	'teamsnap.com',
	'meetup.com',
	'eventbrite.com',
];

const INSTAGRAM_RESERVED_PATHS = new Set(['p', 'reel', 'reels', 'explore', 'stories']);

function parseUrl(value: string): URL | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
	} catch {
		return null;
	}
}

function bareHost(url: URL): string {
	return url.hostname.toLowerCase().replace(/^(www|m|web|mobile)\./, '');
}

function isSharedHost(host: string): boolean {
	return SHARED_HOSTS.some((shared) => host === shared || host.endsWith(`.${shared}`));
}

function instagramHandleFromLink(link: string): string | null {
	const url = parseUrl(link);
	if (!url || bareHost(url) !== 'instagram.com') return null;
	const [first] = url.pathname.split('/').filter(Boolean);
	if (!first || INSTAGRAM_RESERVED_PATHS.has(first.toLowerCase())) return null;
	return first.toLowerCase();
}

function facebookKey(link: string): string | null {
	const url = parseUrl(link);
	if (!url) return null;
	const host = bareHost(url);
	if (host !== 'facebook.com' && host !== 'fb.com') return null;
	const path = url.pathname.toLowerCase().replace(/\/+$/, '');
	if (path === '/profile.php') {
		const id = url.searchParams.get('id');
		return id ? `profile:${id}` : null;
	}
	return path.length > 1 ? path : null;
}

export function duplicateSignals(
	fields: DuplicateSignalFields,
): Record<DuplicateSignalKey, string[]> {
	const email = fields.contactEmail?.trim().toLowerCase();

	const handles = [
		fields.instagram ? stripInstagramHandle(fields.instagram).toLowerCase() : null,
		fields.instagramLink ? instagramHandleFromLink(fields.instagramLink) : null,
	].filter((handle): handle is string => Boolean(handle));

	const websiteUrl = fields.website ? parseUrl(fields.website) : null;
	const websiteHost = websiteUrl ? bareHost(websiteUrl) : null;

	const facebook = fields.facebookLink ? facebookKey(fields.facebookLink) : null;

	return {
		email: email ? [email] : [],
		instagram: [...new Set(handles)],
		website: websiteHost && !isSharedHost(websiteHost) ? [websiteHost] : [],
		facebook: facebook ? [facebook] : [],
	};
}

const GENERIC_NAME_WORDS = new Set([
	'the',
	'of',
	'and',
	'team',
	'club',
	'cycling',
	'cyclists',
	'bicycle',
	'bike',
	'bikes',
	'racing',
	'race',
	'association',
	'organization',
	'org',
]);

const NAME_SIMILARITY_THRESHOLD = 0.85;

function nameKey(name: string): string {
	const tokens = name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter(Boolean);
	const distinctive = tokens.filter((token) => !GENERIC_NAME_WORDS.has(token));
	return (distinctive.length > 0 ? distinctive : tokens).join('');
}

function bigrams(value: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (let i = 0; i < value.length - 1; i += 1) {
		const pair = value.slice(i, i + 2);
		counts.set(pair, (counts.get(pair) ?? 0) + 1);
	}
	return counts;
}

export function namesAreSimilar(a: string, b: string): boolean {
	const first = nameKey(a);
	const second = nameKey(b);
	if (first.length < 3 || second.length < 3) return false;
	if (first === second) return true;

	const left = bigrams(first);
	const right = bigrams(second);
	let shared = 0;
	for (const [pair, count] of left) {
		shared += Math.min(count, right.get(pair) ?? 0);
	}
	const total = first.length - 1 + (second.length - 1);
	return (2 * shared) / total >= NAME_SIMILARITY_THRESHOLD;
}
