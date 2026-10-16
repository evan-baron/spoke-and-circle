import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PendingTeamReview } from '@/components/forms/TeamForm/PendingTeamReview';
import TeamOwnerTransfer from '@/components/team/TeamOwnerTransfer/TeamOwnerTransfer';
import { toTeamFormValues } from '@/lib/api/teamMapper';
import { formatSubmittedDate, formatSubmitter } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { PossibleDuplicates } from '@/components/admin/PossibleDuplicates/PossibleDuplicates';
import { findPossibleDuplicates } from '@/services/duplicateService';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../../admin.module.scss';
import { ArrowIcon } from '@/components/ui/ArrowIcon/ArrowIcon';

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
			media: true,
			submittedBy: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
	});
	if (!team) notFound();

	const duplicates = (await findPossibleDuplicates([team])).get(team.id) ?? [];

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
					<ArrowIcon direction='left' /> Pending groups
				</Link>
				<h1>Review: {team.name}</h1>
				<p className={styles.count}>
					Submitted {formatSubmittedDate(team.createdAt)} by{' '}
					{formatSubmitter(team.submittedBy)}
				</p>

				{duplicates.length > 0 && (
					<div className={styles.notice} role='status'>
						<p>
							<strong>Possible duplicate.</strong> This submission shares
							details or a similar name with an existing listing:
						</p>
						<PossibleDuplicates matches={duplicates} />
					</div>
				)}

				<TeamOwnerTransfer
					teamId={team.id}
					teamName={team.name}
					owner={team.submittedBy}
				/>

				<PendingTeamReview
					teamId={team.id}
					initialValues={toTeamFormValues(team)}
					initialVerified={team.verified}
					submitter={submitter}
				/>
			</div>
		</div>
	);
}
