export const SITE_NAME = 'Spoke & Circle';

export const SITE_TITLE =
	'Spoke & Circle | Cycling Team & Group Ride Finder';

export const SITE_DESCRIPTION =
	'Find cycling teams, clubs, and group rides near you. Search by location, riding style, and skill level, from casual no-drop road and gravel rides to competitive racing teams.';

export const SITE_KEYWORDS = [
	'cycling team finder',
	'cycling group ride finder',
	'group ride',
	'group rides near me',
	'cycling groups',
	'cycling teams',
	'cycling clubs',
	'bike clubs near me',
	'bike team finder',
	'road cycling groups',
	'gravel group rides',
	'mountain bike clubs',
	'beginner cycling groups',
	'no-drop group rides',
	'find a cycling team',
	'racing teams',
];

export const SUPPORT_EMAIL = 'support@spokeandcircle.com';

export const OG_IMAGE_PATH = '/og-image.png';

export function getSiteUrl(): string {
	return (process.env.APP_BASE_URL ?? 'https://spokeandcircle.com').replace(
		/\/+$/,
		'',
	);
}
