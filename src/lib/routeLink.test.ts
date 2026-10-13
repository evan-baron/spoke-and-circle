import { describe, expect, it } from 'vitest';
import { parseRouteLink } from './routeLink';

describe('parseRouteLink', () => {
	it('parses a Ride with GPS route link', () => {
		expect(parseRouteLink('https://ridewithgps.com/routes/41946700')).toEqual({
			provider: 'Ride with GPS',
			id: '41946700',
			embedSrc: 'https://ridewithgps.com/embeds?type=route&id=41946700',
		});
	});

	it('ignores query strings, trailing slashes and www', () => {
		expect(
			parseRouteLink('https://www.ridewithgps.com/routes/41946700/?lang=en')
				?.embedSrc,
		).toBe('https://ridewithgps.com/embeds?type=route&id=41946700');
	});

	it('parses a Strava route link', () => {
		expect(parseRouteLink('https://www.strava.com/routes/18347619')).toEqual({
			provider: 'Strava',
			id: '18347619',
			embedSrc: 'https://strava-embeds.com/route/18347619',
		});
	});

	it('reads the id from a Strava category route link', () => {
		expect(
			parseRouteLink(
				'https://www.strava.com/routes/gravel-biking/usa/north-carolina/3247927244737326260',
			)?.id,
		).toBe('3247927244737326260');
	});

	it('returns null for other services', () => {
		expect(parseRouteLink('https://www.komoot.com/tour/12345')).toBeNull();
		expect(
			parseRouteLink('https://www.alltrails.com/trail/us/colorado/x'),
		).toBeNull();
	});

	it('returns null for non-route pages on supported services', () => {
		expect(parseRouteLink('https://ridewithgps.com/trips/123')).toBeNull();
		expect(parseRouteLink('https://www.strava.com/activities/123')).toBeNull();
		expect(parseRouteLink('https://ridewithgps.com/routes/abc')).toBeNull();
	});

	it('does not match look-alike hosts', () => {
		expect(
			parseRouteLink('https://ridewithgps.com.evil.example/routes/1'),
		).toBeNull();
		expect(parseRouteLink('https://notstrava.com/routes/1')).toBeNull();
	});

	it('returns null for empty, invalid and non-http input', () => {
		expect(parseRouteLink(undefined)).toBeNull();
		expect(parseRouteLink('')).toBeNull();
		expect(parseRouteLink('not a url')).toBeNull();
		expect(parseRouteLink('javascript:alert(1)')).toBeNull();
	});
});
