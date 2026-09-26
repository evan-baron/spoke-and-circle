import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../admin.module.scss';

export const metadata: Metadata = {
	title: 'All Users | Admin',
	robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
	await requireAdmin();

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					&larr; Admin console
				</Link>
				<h1>All Users</h1>
			</div>
		</div>
	);
}
