'use client';

import Link from 'next/link';
import { usePendingTeamCount } from '@/hooks/usePendingTeamCount';
import styles from './header.module.scss';

interface AdminNavLinkProps {
	initialCount?: number;
}

const AdminNavLink = ({ initialCount }: AdminNavLinkProps) => {
	const { data: pendingCount } = usePendingTeamCount(initialCount);

	return (
		<Link href='/admin' className={styles.navAdmin}>
			Admin Console
			{!!pendingCount && (
				<span className={styles.pendingBadge}>{pendingCount}</span>
			)}
		</Link>
	);
};

export default AdminNavLink;
