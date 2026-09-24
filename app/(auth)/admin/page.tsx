import { requireAdmin } from '@/services/currentUserService';

export default async function AdminPage() {
	await requireAdmin();

	return (
		<div>
			<h1>Admin</h1>
		</div>
	);
}
