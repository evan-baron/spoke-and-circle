import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminUsersTable } from '@/components/AdminUsersTable/AdminUsersTable';
import { Pagination } from '@/components/Pagination/Pagination';
import { prisma } from '@/lib/prisma';
import {
	parseSearchParams,
	type RawSearchParams,
	TEAMS_PAGE_SIZE,
} from '@/lib/searchParams';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../admin.module.scss';

export const metadata: Metadata = {
	title: 'All Users | Admin',
	robots: { index: false, follow: false },
};

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	await requireAdmin();

	const rawParams = await searchParams;
	const { page: requestedPage } = parseSearchParams(rawParams);

	const totalCount = await prisma.user.count();
	const pageCount = Math.max(1, Math.ceil(totalCount / TEAMS_PAGE_SIZE));
	const page = Math.min(requestedPage, pageCount);

	const users = await prisma.user.findMany({
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		skip: (page - 1) * TEAMS_PAGE_SIZE,
		take: TEAMS_PAGE_SIZE,
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			createdAt: true,
			teams: {
				orderBy: { name: 'asc' },
				select: { id: true, name: true, status: true },
			},
		},
	});

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					&larr; Admin console
				</Link>
				<h1>All Users</h1>

				<AdminUsersTable users={users} totalCount={totalCount} />

				<Pagination
					basePath='/admin/users'
					searchParams={rawParams}
					page={page}
					pageCount={pageCount}
				/>
			</div>
		</div>
	);
}
