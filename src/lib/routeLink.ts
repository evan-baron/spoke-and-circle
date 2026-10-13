export type RouteProvider = 'Ride with GPS' | 'Strava';

export interface ParsedRouteLink {
	provider: RouteProvider;
	id: string;
	embedSrc: string;
}

const RIDE_WITH_GPS_ROUTE_PATH = /^\/routes\/(\d+)\/?$/;
const STRAVA_ROUTE_PATH = /^\/routes\/(?:[^/]+\/)*(\d+)\/?$/;

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

	return null;
}
