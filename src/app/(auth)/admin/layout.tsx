import type { Metadata } from 'next';
import { requireAdmin } from '@/services/currentUserService';

export const metadata: Metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireAdmin();

	return <>{children}</>;
}
