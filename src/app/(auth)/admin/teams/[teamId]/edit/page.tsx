import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminTeamEdit } from '@/components/TeamForm/AdminTeamEdit';
import TeamOwnerTransfer from '@/components/TeamOwnerTransfer/TeamOwnerTransfer';
import { toTeamFormValues } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../../../admin.module.scss';

export const metadata: Metadata = {
	title: 'Edit Group | Admin',
	robots: { index: false, follow: false },
};

export default async function AdminEditTeamPage({
	params,
}: {
	params: Promise<{ teamId: string }>;
}) {
	await requireAdmin();

	const { teamId } = await params;
	const team = await prisma.team.findFirst({
		where: { id: teamId, status: 'Approved' },
		include: {
			submittedBy: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
	});
	if (!team) notFound();

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href={`/teams/${team.id}`} className={styles.backLink}>
					&larr; {team.name}
				</Link>
				<h1>Edit: {team.name}</h1>

				<TeamOwnerTransfer
					teamId={team.id}
					teamName={team.name}
					owner={team.submittedBy}
				/>

				<AdminTeamEdit
					teamId={team.id}
					initialValues={toTeamFormValues(team)}
					initialVerified={team.verified}
				/>
			</div>
		</div>
	);
}
