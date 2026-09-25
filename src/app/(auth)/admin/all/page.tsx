import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminTeamsTable } from '@/components/AdminTeamsTable/AdminTeamsTable';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { Pagination } from '@/components/Pagination/Pagination';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import { requireAdmin } from '@/services/currentUserService';
import { searchApprovedTeams } from '@/services/teamSearchService';
import styles from '../admin.module.scss';

export const metadata: Metadata = {
	title: 'All Groups | Admin | Spoke & Circle',
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
		params.q && ` for “${params.q}”`,
		params.location && ` near “${params.location}”`,
		params.bikeTypes.length > 1 && ` riding ${params.bikeTypes.join(', ')}`,
	]
		.filter(Boolean)
		.join('');

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					&larr; Admin console
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
					defaultWomensOnly={params.womensOnly}
					defaultYouthOnly={params.youthOnly}
					defaultAcceptingNewRiders={params.acceptingNewRiders}
				/>

				<AdminTeamsTable
					teams={teams}
					totalCount={total}
					summarySuffix={summarySuffix}
				/>

				<Pagination
					basePath='/admin/all'
					searchParams={rawParams}
					page={page}
					pageCount={pageCount}
				/>
			</div>
		</div>
	);
}
