import type { Metadata } from 'next';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { ResultsTable } from '@/components/ResultsTable/ResultsTable';
import { SearchLocationTracker } from '@/components/SearchLocationTracker/SearchLocationTracker';
import { searchTeams } from '@/lib/search';
import type { BikeType, ClubType } from '@/lib/types';

const CLUB_TYPES: ClubType[] = ['Team', 'Club', 'Group', 'Organization'];
const BIKE_TYPES: BikeType[] = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'Tri',
	'E-bike',
	'Mixed',
];

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
	if (Array.isArray(value)) return value[0] ?? '';
	return value ?? '';
}

function parseParams(raw: RawSearchParams) {
	const q = firstValue(raw.q);
	const location = firstValue(raw.location);
	const typeRaw = firstValue(raw.type);
	const bikeTypeRaw = firstValue(raw.bikeType);

	const type =
		CLUB_TYPES.includes(typeRaw as ClubType) ?
			(typeRaw as ClubType)
		:	undefined;
	const bikeType =
		BIKE_TYPES.includes(bikeTypeRaw as BikeType) ?
			(bikeTypeRaw as BikeType)
		:	undefined;

	return { q, location, type, bikeType };
}

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
	const { q } = parseParams(await searchParams);
	return {
		title:
			q ?
				`"${q}" — Search results — Spoke & Circle`
			:	'Search teams — Spoke & Circle',
	};
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	const params = parseParams(await searchParams);
	const results = searchTeams(params);

	return (
		<main>
			<SearchLocationTracker />
			<div>
				<h1>Search results</h1>

				<FilterBar
					defaultQ={params.q}
					defaultLocation={params.location}
					defaultType={params.type ?? ''}
					defaultBikeType={params.bikeType ?? ''}
				/>

				<p>
					{results.length} {results.length === 1 ? 'team' : 'teams'} found
					{params.q && <> for &ldquo;{params.q}&rdquo;</>}
					{params.location && <> near &ldquo;{params.location}&rdquo;</>}
				</p>

				<ResultsTable teams={results} />
			</div>
		</main>
	);
}
