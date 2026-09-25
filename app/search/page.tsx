import type { Metadata } from 'next';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { ResultsTable } from '@/components/ResultsTable/ResultsTable';
import { SearchLocationTracker } from '@/components/SearchLocationTracker/SearchLocationTracker';
import { searchTeams } from '@/lib/search';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import styles from './search.module.scss';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
	const { q } = parseSearchParams(await searchParams);
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
	const params = parseSearchParams(await searchParams);
	const results = searchTeams(params);

	return (
		<div className={styles.page}>
			<SearchLocationTracker />
			<div className={styles.wrap}>
				<h1>Search results</h1>

				<FilterBar
					defaultQ={params.q}
					defaultLocation={params.location}
					defaultType={params.type ?? ''}
					defaultBikeTypes={params.bikeTypes}
					defaultDiscipline={params.discipline ?? ''}
					defaultSkillLevel={params.skillLevel ?? ''}
					defaultCompetitiveOrCasual={params.competitiveOrCasual ?? ''}
					defaultWomensOnly={params.womensOnly}
					defaultYouthOnly={params.youthOnly}
					defaultAcceptingNewRiders={params.acceptingNewRiders}
				/>

				<p className={styles.count}>
					{results.length} {results.length === 1 ? 'result' : 'results'}
					{params.q && <> for &ldquo;{params.q}&rdquo;</>}
					{params.location && <> near &ldquo;{params.location}&rdquo;</>}
					{params.bikeTypes.length > 1 && (
						<> riding {params.bikeTypes.join(', ')}</>
					)}
				</p>

				<ResultsTable teams={results} />
			</div>
		</div>
	);
}
