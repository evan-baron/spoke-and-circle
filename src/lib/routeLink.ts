export interface RouteEmbed {
	provider: 'Ride with GPS' | 'Strava';
	src: string;
}

const RIDE_WITH_GPS_ROUTE_PATH = /^\/routes\/(\d+)\/?$/;
const STRAVA_ROUTE_PATH = /^\/routes\/(?:[^/]+\/)*(\d+)\/?$/;

export function getRouteEmbed(link: string | undefined): RouteEmbed | null {
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
			src: `https://ridewithgps.com/embeds?type=route&id=${id}`,
		};
	}

	if (host === 'strava.com') {
		const id = STRAVA_ROUTE_PATH.exec(url.pathname)?.[1];
		if (!id) return null;
		return {
			provider: 'Strava',
			src: `https://strava-embeds.com/route/${id}`,
		};
	}

	return null;
}
