import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminTeamEdit } from '@/components/TeamForm/AdminTeamEdit';
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
	});
	if (!team) notFound();

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href={`/teams/${team.id}`} className={styles.backLink}>
					&larr; {team.name}
				</Link>
				<h1>Edit: {team.name}</h1>

				<AdminTeamEdit
					teamId={team.id}
					initialValues={toTeamFormValues(team)}
					initialVerified={team.verified}
				/>
			</div>
		</div>
	);
}
