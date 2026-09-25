import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../admin.module.scss';

export const metadata: Metadata = {
	title: 'Pending Groups | Admin | Spoke & Circle',
	robots: { index: false, follow: false },
};

export default async function AdminPendingPage() {
	await requireAdmin();

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					&larr; Admin console
				</Link>
				<h1>Pending Groups</h1>
			</div>
		</div>
	);
}
