import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminTeamsTable } from '@/components/AdminTeamsTable/AdminTeamsTable';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { searchTeams } from '@/lib/search';
import { parseSearchParams, type RawSearchParams } from '@/lib/searchParams';
import { requireAdmin } from '@/services/currentUserService';
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

	const params = parseSearchParams(await searchParams);
	const results = searchTeams(params);

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
					defaultType={params.type ?? ''}
					defaultBikeTypes={params.bikeTypes}
					defaultDiscipline={params.discipline ?? ''}
					defaultSkillLevel={params.skillLevel ?? ''}
					defaultCompetitiveOrCasual={params.competitiveOrCasual ?? ''}
					defaultWomensOnly={params.womensOnly}
					defaultYouthOnly={params.youthOnly}
					defaultAcceptingNewRiders={params.acceptingNewRiders}
				/>

				<AdminTeamsTable teams={results} summarySuffix={summarySuffix} />
			</div>
		</div>
	);
}
