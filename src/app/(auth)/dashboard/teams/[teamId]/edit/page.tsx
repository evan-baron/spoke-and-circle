import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OwnerTeamEdit } from '@/components/TeamForm/OwnerTeamEdit';
import styles from '@/components/TeamForm/teamForm.module.scss';
import { toTeamFormValues } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/services/currentUserService';
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

export const metadata: Metadata = {
	title: 'Edit Team | Dashboard',
	robots: { index: false, follow: false },
};

export default async function OwnerEditTeamPage({
	params,
}: {
	params: Promise<{ teamId: string }>;
}) {
	const { teamId } = await params;
	const user = await requireUser(`/dashboard/teams/${teamId}/edit`);

	const team = await prisma.team.findFirst({
		where: { id: teamId, status: 'Approved', submittedById: user.id },
		include: { media: true },
	});
	if (!team) notFound();

	return (
		<div className={styles.page}>
			<div className={styles.wrap}>
				<Link href='/dashboard' className={styles.backLink}>
					<ArrowIcon direction='left' /> My Dashboard
				</Link>

				<header className={styles.header}>
					<h1>Edit: {team.name}</h1>
				</header>

				<OwnerTeamEdit teamId={team.id} initialValues={toTeamFormValues(team)} />
			</div>
		</div>
	);
}
