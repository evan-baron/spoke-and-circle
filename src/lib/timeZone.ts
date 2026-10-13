import tzlookup from 'tz-lookup';

export function timeZoneFor(
	latitude: number | null | undefined,
	longitude: number | null | undefined,
): string | undefined {
	if (latitude == null || longitude == null) return undefined;
	try {
		return tzlookup(latitude, longitude);
	} catch {
		return undefined;
	}
}

export function formatTimeZoneLabel(
	timeZone: string | undefined,
): string | null {
	if (!timeZone) return null;
	try {
		const part = new Intl.DateTimeFormat('en-US', {
			timeZone,
			timeZoneName: 'longGeneric',
		})
			.formatToParts(new Date())
			.find((entry) => entry.type === 'timeZoneName');
		return part?.value ?? null;
	} catch {
		return null;
	}
}
