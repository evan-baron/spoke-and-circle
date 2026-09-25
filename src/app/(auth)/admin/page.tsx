import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/services/currentUserService';
import styles from './admin.module.scss';

export default async function AdminPage() {
	await requireAdmin();

	const pendingCount = await prisma.team.count({
		where: { status: 'Pending' },
	});

	return (
		<div className={styles.page}>
			<div className={styles.consoleWrap}>
				<p className={styles.eyebrow}>Admin</p>
				<h1>Admin Console</h1>
				<div className={styles.actions}>
					<Link href='/admin/pending' className={styles.buttonSolid}>
						Pending Groups ({pendingCount})
					</Link>
					<Link href='/admin/all' className={styles.buttonOutline}>
						All Groups
					</Link>
					<Link href='/admin/users' className={styles.buttonOutline}>
						All Users
					</Link>
				</div>
			</div>
		</div>
	);
}
