import DashboardView from '@/components/DashboardView/DashboardView';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/services/currentUserService';

export default async function DashboardPage() {
	const currentUser = await requireUser('/dashboard');

	const user = await prisma.user.findUnique({
		where: { email: currentUser.email },
		select: {
			teams: {
				orderBy: { name: 'asc' },
				select: { id: true, name: true, location: true, status: true },
			},
		},
	});

	return <DashboardView teams={user?.teams ?? []} />;
}
