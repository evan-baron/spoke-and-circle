import type { Metadata } from 'next';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { Pagination } from '@/components/Pagination/Pagination';
import { ResultsTable } from '@/components/ResultsTable/ResultsTable';
import { SearchLocationTracker } from '@/components/SearchLocationTracker/SearchLocationTracker';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import { searchApprovedTeams } from '@/services/teamSearchService';
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
	const rawParams = await searchParams;
	const { page: requestedPage, ...params } = parseSearchParams(rawParams);
	const { teams, total, page, pageCount } = await searchApprovedTeams(
		params,
		requestedPage,
	);

	return (
		<div className={styles.page}>
			<SearchLocationTracker />
			<div className={styles.wrap}>
				<h1>Search results</h1>

				<FilterBar
					defaultQ={params.q}
					defaultLocation={params.location}
					defaultRadius={params.radius}
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
					{total} {total === 1 ? 'result' : 'results'}
					{params.q && <> for &ldquo;{params.q}&rdquo;</>}
					{params.location && <> near &ldquo;{params.location}&rdquo;</>}
					{params.bikeTypes.length > 1 && (
						<> riding {params.bikeTypes.join(', ')}</>
					)}
				</p>

				<ResultsTable teams={teams} />

				<Pagination
					basePath='/search'
					searchParams={rawParams}
					page={page}
					pageCount={pageCount}
				/>
			</div>
		</div>
	);
}
