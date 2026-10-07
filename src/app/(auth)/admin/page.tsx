import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/services/currentUserService';
import { countPendingClaims } from '@/services/teamClaimService';
import styles from './admin.module.scss';

export default async function AdminPage() {
	await requireAdmin();

	const [pendingCount, claimCount] = await Promise.all([
		prisma.team.count({ where: { status: 'Pending' } }),
		countPendingClaims(),
	]);

	return (
		<div className={styles.page}>
			<div className={styles.consoleWrap}>
				<p className={styles.eyebrow}>Admin</p>
				<h1>Admin Console</h1>
				<div className={styles.actions}>
					<Link href='/admin/pending' className={styles.buttonSolid}>
						Pending Groups
						{pendingCount > 0 && (
							<span className={styles.countBadge}>{pendingCount}</span>
						)}
					</Link>
					<Link href='/admin/claims' className={styles.buttonOutline}>
						Claims
						{claimCount > 0 && (
							<span className={styles.countBadge}>{claimCount}</span>
						)}
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
