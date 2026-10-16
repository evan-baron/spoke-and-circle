import type { Metadata } from 'next';
import Link from 'next/link';
import { formatSubmittedDate, formatSubmitter } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge/Badge';
import { PossibleDuplicates } from '@/components/admin/PossibleDuplicates/PossibleDuplicates';
import {
	DUPLICATE_CHECK_SELECT,
	findPossibleDuplicates,
} from '@/services/duplicateService';
import { requireAdmin } from '@/services/currentUserService';
import styles from '../admin.module.scss';
import { ArrowIcon } from '@/components/ui/ArrowIcon/ArrowIcon';

export const metadata: Metadata = {
	title: 'Pending Groups | Admin',
	robots: { index: false, follow: false },
};

const MAX_ROWS = 200;

const EMAIL_NOTICES: Record<string, (outcome: string) => string> = {
	no_recipient: (outcome) =>
		`Group ${outcome}. No email was sent because it was submitted without an account.`,
	not_configured: (outcome) =>
		`Group ${outcome}. Email is not set up on this server, so no message was sent.`,
	throttled: (outcome) =>
		`Group ${outcome}, but the email was not sent because a sending limit was reached.`,
	failed: (outcome) => `Group ${outcome}, but the email could not be sent.`,
};

export default async function AdminPendingPage({
	searchParams,
}: {
	searchParams: Promise<{
		emailStatus?: string | string[];
		outcome?: string | string[];
	}>;
}) {
	await requireAdmin();

	const { emailStatus, outcome } = await searchParams;
	const emailNotice =
		typeof emailStatus === 'string' ?
			EMAIL_NOTICES[emailStatus]?.(outcome === 'approved' ? 'approved' : 'rejected')
		:	undefined;

	const where = { status: 'Pending' as const };
	const [teams, total] = await Promise.all([
		prisma.team.findMany({
			where,
			orderBy: { createdAt: 'asc' },
			take: MAX_ROWS,
			select: {
				...DUPLICATE_CHECK_SELECT,
				name: true,
				createdAt: true,
				submittedBy: {
					select: { firstName: true, lastName: true, email: true },
				},
			},
		}),
		prisma.team.count({ where }),
	]);
	const duplicates = await findPossibleDuplicates(teams);

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					<ArrowIcon direction='left' /> Admin console
				</Link>
				<h1>Pending Groups</h1>
				{emailNotice && (
					<p className={styles.notice} role='status'>
						{emailNotice}
					</p>
				)}
				<p className={styles.count}>
					{total} {total === 1 ? 'group' : 'groups'} waiting for review
					{total > MAX_ROWS && <> (showing the oldest {MAX_ROWS})</>}
				</p>

				{teams.length === 0 ?
					<div className={styles.empty}>
						<p>No pending groups.</p>
					</div>
				:	<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Name</th>
									<th>Submitted</th>
									<th>Submitted by</th>
									<th>Possible duplicates</th>
								</tr>
							</thead>
							<tbody>
								{teams.map((team) => (
									<tr key={team.id}>
										<td className={styles.nameCell}>
											<Link href={`/admin/pending/${team.id}`} className={styles.nameLink}>
												{team.name}
											</Link>
											{duplicates.has(team.id) && (
												<>
													{' '}
													{duplicates.get(team.id)?.some((match) => !match.nameOnly) ?
														<Badge tone='rust'>Possible duplicate</Badge>
													:	<Badge tone='gold'>Similar name</Badge>}
												</>
											)}
										</td>
										<td>
											<time dateTime={team.createdAt.toISOString()}>
												{formatSubmittedDate(team.createdAt)}
											</time>
										</td>
										<td>{formatSubmitter(team.submittedBy)}</td>
										<td>
											{duplicates.has(team.id) && (
												<PossibleDuplicates matches={duplicates.get(team.id) ?? []} />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</div>
		</div>
	);
}
