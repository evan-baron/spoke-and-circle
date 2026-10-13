export type RouteProvider = 'Ride with GPS' | 'Strava' | 'Komoot';

export interface ParsedRouteLink {
	provider: RouteProvider;
	id: string;
	embedSrc: string;
}

const RIDE_WITH_GPS_ROUTE_PATH = /^\/routes\/(\d+)\/?$/;
const STRAVA_ROUTE_PATH = /^\/routes\/(?:[^/]+\/)*(\d+)\/?$/;
const KOMOOT_TOUR_PATH = /^\/(?:[a-z]{2}-[a-z]{2}\/)?tour\/(\d+)\/?$/i;

export function parseRouteLink(link: string | undefined): ParsedRouteLink | null {
	if (!link) return null;

	let url: URL;
	try {
		url = new URL(link);
	} catch {
		return null;
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

	const host = url.hostname.toLowerCase().replace(/^www\./, '');

	if (host === 'ridewithgps.com') {
		const id = RIDE_WITH_GPS_ROUTE_PATH.exec(url.pathname)?.[1];
		if (!id) return null;
		return {
			provider: 'Ride with GPS',
			id,
			embedSrc: `https://ridewithgps.com/embeds?type=route&id=${id}`,
		};
	}

	if (host === 'strava.com') {
		const id = STRAVA_ROUTE_PATH.exec(url.pathname)?.[1];
		if (!id) return null;
		return {
			provider: 'Strava',
			id,
			embedSrc: `https://strava-embeds.com/route/${id}`,
		};
	}

	if (host === 'komoot.com' || host === 'komoot.de') {
		const id = KOMOOT_TOUR_PATH.exec(url.pathname)?.[1];
		if (!id) return null;
		return {
			provider: 'Komoot',
			id,
			embedSrc: `https://www.komoot.com/tour/${id}/embed?layout=classic&profile=1`,
		};
	}

	return null;
}

export type RouteLinkStatus =
	| { kind: 'map'; provider: RouteProvider }
	| { kind: 'wrong-page'; provider: RouteProvider }
	| { kind: 'plain' };

export function describeRouteLink(link: string): RouteLinkStatus | null {
	const trimmed = link.trim();
	if (!trimmed) return null;

	const parsed = parseRouteLink(trimmed);
	if (parsed) return { kind: 'map', provider: parsed.provider };

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return null;
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

	const host = url.hostname.toLowerCase().replace(/^www\./, '');
	if (host === 'ridewithgps.com') {
		return { kind: 'wrong-page', provider: 'Ride with GPS' };
	}
	if (host === 'strava.com') return { kind: 'wrong-page', provider: 'Strava' };
	if (host === 'komoot.com' || host === 'komoot.de') {
		return { kind: 'wrong-page', provider: 'Komoot' };
	}

	return { kind: 'plain' };
}
