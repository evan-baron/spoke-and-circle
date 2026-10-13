import { describe, expect, it } from 'vitest';
import { describeRouteLink, parseRouteLink } from './routeLink';

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
		expect(parseRouteLink('https://www.garmin.com/course/12345')).toBeNull();
		expect(
			parseRouteLink('https://www.alltrails.com/trail/us/colorado/x'),
		).toBeNull();
	});

	it('parses a Komoot tour link, with or without a language prefix', () => {
		expect(parseRouteLink('https://www.komoot.com/tour/234387652')).toEqual({
			provider: 'Komoot',
			id: '234387652',
			embedSrc: 'https://www.komoot.com/tour/234387652/embed?layout=classic&profile=1',
		});
		expect(
			parseRouteLink('https://www.komoot.com/en-us/tour/234387652?ref=wtd')
				?.embedSrc,
		).toBe('https://www.komoot.com/tour/234387652/embed?layout=classic&profile=1');
	});

	it('returns null for Komoot pages that are not tours', () => {
		expect(
			parseRouteLink('https://www.komoot.com/smarttour/e1436441884/loop'),
		).toBeNull();
		expect(parseRouteLink('https://www.komoot.com/highlight/6017312')).toBeNull();
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

describe('describeRouteLink', () => {
	it('says a supported route link will show a map', () => {
		expect(describeRouteLink('https://ridewithgps.com/routes/41946700')).toEqual({
			kind: 'map',
			provider: 'Ride with GPS',
		});
		expect(describeRouteLink('https://www.strava.com/routes/18347619')).toEqual({
			kind: 'map',
			provider: 'Strava',
		});
	});

	it('flags links to the right site that are not routes', () => {
		expect(describeRouteLink('https://www.strava.com/activities/123')).toEqual({
			kind: 'wrong-page',
			provider: 'Strava',
		});
		expect(describeRouteLink('https://ridewithgps.com/trips/123')).toEqual({
			kind: 'wrong-page',
			provider: 'Ride with GPS',
		});
	});

	it('treats other sites as plain links', () => {
		expect(
			describeRouteLink('https://www.alltrails.com/trail/us/colorado/x'),
		).toEqual({
			kind: 'plain',
		});
	});

	it('stays quiet for empty or unfinished input', () => {
		expect(describeRouteLink('')).toBeNull();
		expect(describeRouteLink('   ')).toBeNull();
		expect(describeRouteLink('ridewithg')).toBeNull();
		expect(describeRouteLink('javascript:alert(1)')).toBeNull();
	});
});
