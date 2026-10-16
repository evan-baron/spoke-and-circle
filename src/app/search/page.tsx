import type { Metadata } from 'next';
import { OffSeasonNotice } from '@/components/search/OffSeasonNotice/OffSeasonNotice';
import { FilterBar } from '@/components/search/FilterBar/FilterBar';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { ResultsTable } from '@/components/search/ResultsTable/ResultsTable';
import { RideCalendar } from '@/components/search/RideCalendar/RideCalendar';
import { SearchLocationTracker } from '@/components/search/SearchLocationTracker/SearchLocationTracker';
import { ViewToggle } from '@/components/search/ViewToggle/ViewToggle';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import {
	searchApprovedRides,
	searchApprovedRideTeams,
	searchApprovedTeams,
} from '@/services/teamSearchService';
import styles from './search.module.scss';

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
	const params = parseSearchParams(await searchParams);
	const hasFilters =
		Boolean(params.q || params.location) ||
		params.bikeTypes.length > 0 ||
		params.racingDisciplines.length > 0 ||
		Boolean(
			params.type ||
			params.discipline ||
			params.skillLevel ||
			params.competitiveOrCasual ||
			params.womensOnly ||
			params.youthOnly ||
			params.acceptingNewRiders ||
			params.view === 'calendar',
		) ||
		params.page > 1;

	const title =
		params.q ? `"${params.q}" cycling teams and group rides`
		: params.location ? `Cycling teams and group rides near ${params.location}`
		: 'Search Cycling Teams & Group Rides';

	return {
		title,
		description:
			'Search cycling teams, clubs, and group rides by location, riding style, skill level, and more. Find no-drop road and gravel rides, racing teams, and beginner-friendly groups.',
		alternates: { canonical: '/search' },
		...(hasFilters ? { robots: { index: false, follow: true } } : {}),
	};
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	const rawParams = await searchParams;
	const {
		page: requestedPage,
		view,
		month,
		...params
	} = parseSearchParams(rawParams);
	const isGroupRideSearch = params.type === 'Group Ride';
	const isCalendarView = view === 'calendar';

	const todayIso = new Date().toISOString().slice(0, 10);
	const calendar = isCalendarView ? await searchApprovedRides(params) : null;
	const includeOffSeason = rawParams.offSeason === 'true';
	const rideList =
		!isCalendarView && isGroupRideSearch ?
			await searchApprovedRideTeams(params, requestedPage, {
				month: Number(todayIso.slice(5, 7)),
				includeOffSeason,
			})
		:	null;
	const list =
		isCalendarView ? null : (
			(rideList ?? (await searchApprovedTeams(params, requestedPage)))
		);
	const total = calendar?.total ?? list?.total ?? 0;

	return (
		<div className={styles.page}>
			<SearchLocationTracker />
			<div className={styles.wrap}>
				<h1>Browse Cycling Teams & Group Rides</h1>

				<FilterBar
					defaultQ={params.q}
					defaultLocation={params.location}
					defaultRadius={params.radius}
					defaultType={params.type ?? ''}
					defaultBikeTypes={params.bikeTypes}
					defaultDiscipline={params.discipline ?? ''}
					defaultSkillLevel={params.skillLevel ?? ''}
					defaultCompetitiveOrCasual={params.competitiveOrCasual ?? ''}
					defaultRacingDisciplines={params.racingDisciplines}
					defaultWomensOnly={params.womensOnly}
					defaultYouthOnly={params.youthOnly}
					defaultAcceptingNewRiders={params.acceptingNewRiders}
					defaultView={view}
				/>

				<div className={styles.status}>
					<p className={styles.count}>
						{total} {total === 1 ? 'result' : 'results'}
						{params.q && <> for &ldquo;{params.q}&rdquo;</>}
						{params.location && <> near &ldquo;{params.location}&rdquo;</>}
						{params.bikeTypes.length > 1 && (
							<> riding {params.bikeTypes.join(', ')}</>
						)}
					</p>

					{rideList && (
						<OffSeasonNotice
							basePath='/search'
							searchParams={rawParams}
							offSeasonCount={rideList.offSeasonCount}
							includeOffSeason={includeOffSeason}
						/>
					)}
				</div>

				{isGroupRideSearch && (
					<ViewToggle
						basePath='/search'
						searchParams={rawParams}
						view={view}
					/>
				)}

				{calendar ?
					<RideCalendar
						key={`${month ?? todayIso.slice(0, 7)}-${calendar.total}`}
						rides={calendar.rides}
						initialMonth={month ?? todayIso.slice(0, 7)}
						todayIso={todayIso}
						total={calendar.total}
						truncated={calendar.truncated}
					/>
				: list ?
					<>
						<ResultsTable
							teams={list.teams}
							isGroupRideSearch={isGroupRideSearch}
						/>

						<Pagination
							basePath='/search'
							searchParams={rawParams}
							page={list.page}
							pageCount={list.pageCount}
						/>
					</>
				:	null}
			</div>
		</div>
	);
}
