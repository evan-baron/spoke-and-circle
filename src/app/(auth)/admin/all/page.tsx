import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminTeamsTable } from '@/components/AdminTeamsTable/AdminTeamsTable';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import {
	parseSearchParams,
	toQueryString,
	type RawSearchParams,
} from '@/lib/searchParams';
import { requireAdmin } from '@/services/currentUserService';
import { searchApprovedTeams } from '@/services/teamSearchService';
import styles from '../admin.module.scss';
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

export const metadata: Metadata = {
	title: 'All Groups | Admin',
	robots: { index: false, follow: false },
};

export default async function AdminAllGroupsPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	await requireAdmin();

	const rawParams = await searchParams;
	const { page: requestedPage, ...params } = parseSearchParams(rawParams);
	const { teams, total, page, pageCount } = await searchApprovedTeams(
		params,
		requestedPage,
	);

	const summarySuffix = [
		params.q && ` for "${params.q}"`,
		params.location && ` near "${params.location}"`,
		params.bikeTypes.length > 1 && ` riding ${params.bikeTypes.join(', ')}`,
	]
		.filter(Boolean)
		.join('');

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					<ArrowIcon direction='left' /> Admin console
				</Link>
				<h1>All Groups</h1>

				<FilterBar
					action='/admin/all'
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
				/>

				<AdminTeamsTable
					queryString={toQueryString(rawParams)}
					initialPage={{ teams, total, page, pageCount }}
					initialPageLoadedAt={Date.now()}
					searchParams={rawParams}
					summarySuffix={summarySuffix}
				/>
			</div>
		</div>
	);
}
