import type { Metadata } from 'next';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { ResultsTable } from '@/components/ResultsTable/ResultsTable';
import { SearchLocationTracker } from '@/components/SearchLocationTracker/SearchLocationTracker';
import { searchTeams } from '@/lib/search';
import type { BikeType, ClubType, MtbDiscipline, SkillLevel } from '@/lib/types';
import styles from './search.module.scss';

const CLUB_TYPES: ClubType[] = [
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
];
const BIKE_TYPES: BikeType[] = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'Tri',
	'E-bike',
	'Mixed',
];
const DISCIPLINES: MtbDiscipline[] = [
	'Cross-country',
	'Trail',
	'Enduro',
	'Downhill',
	'All-mountain',
];
const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const RACING_OPTIONS = ['Competitive', 'Casual'] as const;

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
	const disciplineRaw = firstValue(raw.discipline);
	const skillLevelRaw = firstValue(raw.skillLevel);
	const competitiveOrCasualRaw = firstValue(raw.competitiveOrCasual);

	const type =
		CLUB_TYPES.includes(typeRaw as ClubType) ?
			(typeRaw as ClubType)
		:	undefined;
	const bikeType =
		BIKE_TYPES.includes(bikeTypeRaw as BikeType) ?
			(bikeTypeRaw as BikeType)
		:	undefined;
	const discipline =
		DISCIPLINES.includes(disciplineRaw as MtbDiscipline) ?
			(disciplineRaw as MtbDiscipline)
		:	undefined;
	const skillLevel =
		SKILL_LEVELS.includes(skillLevelRaw as SkillLevel) ?
			(skillLevelRaw as SkillLevel)
		:	undefined;
	const competitiveOrCasual =
		(RACING_OPTIONS as readonly string[]).includes(competitiveOrCasualRaw) ?
			(competitiveOrCasualRaw as (typeof RACING_OPTIONS)[number])
		:	undefined;
	const womensOnly = firstValue(raw.womensOnly) === 'true';
	const youthOnly = firstValue(raw.youthOnly) === 'true';
	const acceptingNewRiders = firstValue(raw.acceptingNewRiders) === 'true';

	return {
		q,
		location,
		type,
		bikeType,
		discipline,
		skillLevel,
		competitiveOrCasual,
		womensOnly,
		youthOnly,
		acceptingNewRiders,
	};
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
				`"${q}" | Search results | Spoke & Circle`
			:	'Search teams | Spoke & Circle',
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
		<main className={styles.page}>
			<SearchLocationTracker />
			<div className={styles.wrap}>
				<h1>Search results</h1>

				<FilterBar
					defaultQ={params.q}
					defaultLocation={params.location}
					defaultType={params.type ?? ''}
					defaultBikeType={params.bikeType ?? ''}
					defaultDiscipline={params.discipline ?? ''}
					defaultSkillLevel={params.skillLevel ?? ''}
					defaultCompetitiveOrCasual={params.competitiveOrCasual ?? ''}
					defaultWomensOnly={params.womensOnly}
					defaultYouthOnly={params.youthOnly}
					defaultAcceptingNewRiders={params.acceptingNewRiders}
				/>

				<p className={styles.count}>
					{results.length} {results.length === 1 ? 'team' : 'teams'} found
					{params.q && <> for &ldquo;{params.q}&rdquo;</>}
					{params.location && <> near &ldquo;{params.location}&rdquo;</>}
				</p>

				<ResultsTable teams={results} />
			</div>
		</main>
	);
}
