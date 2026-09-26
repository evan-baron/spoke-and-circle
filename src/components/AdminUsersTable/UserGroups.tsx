import Link from 'next/link';
import type { AdminUserRow } from './adminUserRow';
import styles from './adminUsersTable.module.scss';

function GroupLink({ team }: { team: AdminUserRow['teams'][number] }) {
	if (team.status === 'Approved') {
		return (
			<Link href={`/teams/${team.id}`} className={styles.groupLink}>
				{team.name}
			</Link>
		);
	}
	if (team.status === 'Pending') {
		return (
			<>
				<Link href={`/admin/pending/${team.id}`} className={styles.groupLink}>
					{team.name}
				</Link>
				<span className={styles.pendingTag}>Pending</span>
			</>
		);
	}
	return <span>{team.name}</span>;
}

export function GroupList({ teams }: { teams: AdminUserRow['teams'] }) {
	if (teams.length === 0) return <span className={styles.muted}>None</span>;

	return (
		<ul className={styles.groupList}>
			{teams.map((team) => (
				<li key={team.id} className={styles.groupLine}>
					<GroupLink team={team} />
				</li>
			))}
		</ul>
	);
}
