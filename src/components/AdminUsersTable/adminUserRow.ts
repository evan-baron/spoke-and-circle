export interface AdminUserRow {
	id: number;
	firstName: string | null;
	lastName: string | null;
	email: string;
	createdAt: Date;
	teams: {
		id: string;
		name: string;
		status: 'Pending' | 'Approved' | 'Rejected';
	}[];
}

export function getUserDisplayName(user: AdminUserRow): string {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
	);
}
