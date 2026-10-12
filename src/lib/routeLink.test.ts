import { describe, expect, it } from 'vitest';
import { getRouteEmbed } from './routeLink';

describe('getRouteEmbed', () => {
	it('builds a Ride with GPS embed from a route link', () => {
		expect(getRouteEmbed('https://ridewithgps.com/routes/41946700')).toEqual({
			provider: 'Ride with GPS',
			src: 'https://ridewithgps.com/embeds?type=route&id=41946700',
		});
	});

	it('ignores query strings, trailing slashes and www', () => {
		expect(
			getRouteEmbed('https://www.ridewithgps.com/routes/41946700/?lang=en')?.src,
		).toBe('https://ridewithgps.com/embeds?type=route&id=41946700');
	});

	it('builds a Strava embed from a route link', () => {
		expect(getRouteEmbed('https://www.strava.com/routes/18347619')).toEqual({
			provider: 'Strava',
			src: 'https://strava-embeds.com/route/18347619',
		});
	});

	it('reads the id from a Strava category route link', () => {
		expect(
			getRouteEmbed(
				'https://www.strava.com/routes/gravel-biking/usa/north-carolina/3247927244737326260',
			)?.src,
		).toBe('https://strava-embeds.com/route/3247927244737326260');
	});

	it('returns null for other services', () => {
		expect(getRouteEmbed('https://www.komoot.com/tour/12345')).toBeNull();
		expect(getRouteEmbed('https://www.alltrails.com/trail/us/colorado/x')).toBeNull();
	});

	it('returns null for non-route pages on supported services', () => {
		expect(getRouteEmbed('https://ridewithgps.com/trips/123')).toBeNull();
		expect(getRouteEmbed('https://www.strava.com/activities/123')).toBeNull();
		expect(getRouteEmbed('https://ridewithgps.com/routes/abc')).toBeNull();
	});

	it('does not match look-alike hosts', () => {
		expect(getRouteEmbed('https://ridewithgps.com.evil.example/routes/1')).toBeNull();
		expect(getRouteEmbed('https://notstrava.com/routes/1')).toBeNull();
	});

	it('returns null for empty, invalid and non-http input', () => {
		expect(getRouteEmbed(undefined)).toBeNull();
		expect(getRouteEmbed('')).toBeNull();
		expect(getRouteEmbed('not a url')).toBeNull();
		expect(getRouteEmbed('javascript:alert(1)')).toBeNull();
	});
});
