import { describe, expect, it } from 'vitest';
import { formatTimeZoneLabel, timeZoneFor } from './timeZone';

describe('timeZoneFor', () => {
	it('finds the zone for US coordinates', () => {
		expect(timeZoneFor(38.8339, -104.8214)).toBe('America/Denver');
		expect(timeZoneFor(40.7128, -74.006)).toBe('America/New_York');
		expect(timeZoneFor(41.8781, -87.6298)).toBe('America/Chicago');
		expect(timeZoneFor(34.0522, -118.2437)).toBe('America/Los_Angeles');
	});

	it('splits states that cross zones by coordinates', () => {
		expect(timeZoneFor(31.7619, -106.485)).toBe('America/Denver');
		expect(timeZoneFor(32.7767, -96.797)).toBe('America/Chicago');
	});

	it('returns undefined when coordinates are missing', () => {
		expect(timeZoneFor(null, -104.8)).toBeUndefined();
		expect(timeZoneFor(38.8, undefined)).toBeUndefined();
	});
});

describe('formatTimeZoneLabel', () => {
	it('uses the generic name so daylight saving never mislabels it', () => {
		expect(formatTimeZoneLabel('America/Denver')).toBe('Mountain Time');
		expect(formatTimeZoneLabel('America/New_York')).toBe('Eastern Time');
		expect(formatTimeZoneLabel('America/Chicago')).toBe('Central Time');
		expect(formatTimeZoneLabel('America/Los_Angeles')).toBe('Pacific Time');
		expect(formatTimeZoneLabel('America/Anchorage')).toBe('Alaska Time');
	});

	it('labels Arizona as Mountain Standard Time because it does not observe daylight saving', () => {
		expect(formatTimeZoneLabel('America/Phoenix')).toBe('Mountain Standard Time');
	});

	it('returns null for missing or invalid zones', () => {
		expect(formatTimeZoneLabel(undefined)).toBeNull();
		expect(formatTimeZoneLabel('Not/AZone')).toBeNull();
	});
});
