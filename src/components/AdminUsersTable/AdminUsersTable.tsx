import tableStyles from '@/components/ResultsTable/resultsTable.module.scss';
import { formatSubmittedDate } from '@/lib/format';
import type { AdminUserRow } from './adminUserRow';
import styles from './adminUsersTable.module.scss';
import { MobileUsersTable } from './MobileUsersTable';
import { GroupList } from './UserGroups';

interface AdminUsersTableProps {
	users: AdminUserRow[];
	totalCount: number;
}

export function AdminUsersTable({ users, totalCount }: AdminUsersTableProps) {
	return (
		<>
			<p className={styles.count}>
				{totalCount} {totalCount === 1 ? 'user' : 'users'}
			</p>

			{users.length === 0 ?
				<div className={tableStyles.empty}>
					<p>No users yet.</p>
				</div>
			:	<>
					<MobileUsersTable users={users} />

					<table className={tableStyles.table}>
						<thead>
							<tr>
								<th>ID</th>
								<th>First</th>
								<th>Last</th>
								<th>Email</th>
								<th>Registered</th>
								<th>Group(s)</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id}>
									<td title={user.id}>{user.id.slice(0, 8)}</td>
									<td>
										{user.firstName ?? '—'}
										{user.role === 'admin' && (
											<span className={styles.adminTag}>Admin</span>
										)}
									</td>
									<td>{user.lastName ?? '—'}</td>
									<td className={styles.email}>{user.email}</td>
									<td>
										<time dateTime={user.createdAt.toISOString()}>
											{formatSubmittedDate(user.createdAt)}
										</time>
									</td>
									<td className={styles.groupsCell}>
										<GroupList teams={user.teams} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			}
		</>
	);
}
