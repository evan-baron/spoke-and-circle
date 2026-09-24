import type { LocationOption } from '@/lib/types';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const FIELD_MASK =
	'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat';
const REQUEST_TIMEOUT_MS = 5000;
const MAX_RESULTS = 8;

interface AutocompleteResponse {
	suggestions?: {
		placePrediction?: {
			placeId: string;
			structuredFormat?: {
				mainText?: { text?: string };
				secondaryText?: { text?: string };
			};
		};
	}[];
}

function toLocationLabel(mainText: string, secondaryText?: string): string {
	const region = secondaryText?.split(',')[0]?.trim();
	return region && region !== 'USA' ? `${mainText}, ${region}` : mainText;
}

export async function searchUsLocations(
	input: string,
): Promise<LocationOption[]> {
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	if (!apiKey) {
		throw new Error('GOOGLE_PLACES_API_KEY is not set');
	}

	const response = await fetch(AUTOCOMPLETE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': FIELD_MASK,
		},
		body: JSON.stringify({
			input,
			includedPrimaryTypes: ['locality', 'administrative_area_level_1'],
			includedRegionCodes: ['us'],
		}),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(
			`Places autocomplete failed with ${response.status}: ${await response.text()}`,
		);
	}

	const data = (await response.json()) as AutocompleteResponse;
	const seen = new Set<string>();
	const locations: LocationOption[] = [];

	for (const suggestion of data.suggestions ?? []) {
		const prediction = suggestion.placePrediction;
		const mainText = prediction?.structuredFormat?.mainText?.text;
		if (!prediction || !mainText) continue;

		const label = toLocationLabel(
			mainText,
			prediction.structuredFormat?.secondaryText?.text,
		);
		if (seen.has(label)) continue;

		seen.add(label);
		locations.push({ placeId: prediction.placeId, label });
	}

	return locations.slice(0, MAX_RESULTS);
}
