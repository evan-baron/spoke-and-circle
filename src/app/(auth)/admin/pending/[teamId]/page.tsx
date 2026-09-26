import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PendingTeamReview } from '@/components/TeamForm/PendingTeamReview';
import { toTeamFormValues } from '@/lib/api/teamMapper';
import { formatSubmittedDate, formatSubmitter } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../../admin.module.scss';

export const metadata: Metadata = {
	title: 'Review Group | Admin',
	robots: { index: false, follow: false },
};

export default async function AdminReviewPendingPage({
	params,
}: {
	params: Promise<{ teamId: string }>;
}) {
	await requireAdmin();

	const { teamId } = await params;
	const team = await prisma.team.findFirst({
		where: { id: teamId, status: 'Pending' },
		include: {
			submittedBy: { select: { firstName: true, lastName: true, email: true } },
		},
	});
	if (!team) notFound();

	const submitter =
		team.submittedBy ?
			{
				name: formatSubmitter(team.submittedBy),
				email: team.submittedBy.email,
			}
		:	null;

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin/pending' className={styles.backLink}>
					&larr; Pending groups
				</Link>
				<h1>Review: {team.name}</h1>
				<p className={styles.count}>
					Submitted {formatSubmittedDate(team.createdAt)} by{' '}
					{formatSubmitter(team.submittedBy)}
				</p>

				<PendingTeamReview
					teamId={team.id}
					initialValues={toTeamFormValues(team)}
					submitter={submitter}
				/>
			</div>
		</div>
	);
}
