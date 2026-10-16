import type { Metadata } from 'next';
import { DefaultLocationNotice } from '@/components/search/DefaultLocationNotice/DefaultLocationNotice';
import { OffSeasonNotice } from '@/components/search/OffSeasonNotice/OffSeasonNotice';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { ResultsTable } from '@/components/search/ResultsTable/ResultsTable';
import { RideCalendar } from '@/components/search/RideCalendar/RideCalendar';
import { SearchForm } from '@/components/search/SearchForm/SearchForm';
import { ViewToggle } from '@/components/search/ViewToggle/ViewToggle';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import {
	searchApprovedRides,
	searchApprovedRideTeams,
} from '@/services/teamSearchService';
import styles from '../search/search.module.scss';

const DEFAULT_LOCATION = 'Denver, CO';
const BASE_PATH = '/group-rides';

export const metadata: Metadata = {
	title: 'Find a Group Ride Near You',
	description:
		'Find group rides near you by location, distance, and cycling discipline.',
	robots: { index: false, follow: false },
};

export default async function GroupRidesPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	const rawParams = await searchParams;
	const {
		page: requestedPage,
		view,
		month,
		...parsed
	} = parseSearchParams({ ...rawParams, type: 'Group Ride' });
	const usingDefaultLocation = !parsed.location;
	const params = {
		...parsed,
		location: parsed.location || DEFAULT_LOCATION,
	};
	const isCalendarView = view === 'calendar';
	const includeOffSeason = rawParams.offSeason === 'true';

	const todayIso = new Date().toISOString().slice(0, 10);
	const currentMonth = Number(todayIso.slice(5, 7));
	const season = { month: currentMonth, includeOffSeason };
	const calendar = isCalendarView ? await searchApprovedRides(params) : null;
	const list =
		isCalendarView ? null : (
			await searchApprovedRideTeams(params, requestedPage, season)
		);
	const total = calendar?.total ?? list?.total ?? 0;

	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				{usingDefaultLocation && (
					<DefaultLocationNotice
						location={DEFAULT_LOCATION}
						radius={params.radius}
					/>
				)}

				<h1>Find a group ride near you</h1>

				<SearchForm
					action={BASE_PATH}
					lockMode='rides'
					formName='group_rides_page'
					defaultLocation={params.location}
					defaultRadius={params.radius}
					defaultDiscipline={params.bikeTypes[0] ?? ''}
				/>

				<ViewToggle basePath={BASE_PATH} searchParams={rawParams} view={view} />

				{!calendar && (
					<div className={styles.status}>
						<p className={styles.count}>
							{total} {total === 1 ? 'ride' : 'rides'} within {params.radius}{' '}
							miles of {params.location}
						</p>

						{list && (
							<OffSeasonNotice
								basePath={BASE_PATH}
								searchParams={rawParams}
								offSeasonCount={list.offSeasonCount}
								includeOffSeason={includeOffSeason}
							/>
						)}
					</div>
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
						<ResultsTable teams={list.teams} isGroupRideSearch />

						<Pagination
							basePath={BASE_PATH}
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
