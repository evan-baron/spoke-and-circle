import type { Metadata } from 'next';
import Link from 'next/link';
import { ClaimReviewButtons } from '@/components/ClaimReviewButtons/ClaimReviewButtons';
import { formatSubmittedDate, formatSubmitter } from '@/lib/format';
import { requireAdmin } from '@/services/currentUserService';
import { listPendingClaims } from '@/services/teamClaimService';
import styles from '../admin.module.scss';
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

export const metadata: Metadata = {
	title: 'Claims | Admin',
	robots: { index: false, follow: false },
};

const EMAIL_NOTICES: Record<string, (outcome: string) => string> = {
	no_recipient: (outcome) =>
		`Claim ${outcome}. No email was sent because the user has no email address.`,
	not_configured: (outcome) =>
		`Claim ${outcome}. Email is not set up on this server, so no message was sent.`,
	throttled: (outcome) =>
		`Claim ${outcome}, but the email was not sent because a sending limit was reached.`,
	failed: (outcome) => `Claim ${outcome}, but the email could not be sent.`,
};

export default async function AdminClaimsPage({
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

	const claims = await listPendingClaims();

	return (
		<div className={styles.subPage}>
			<div className={styles.subWrap}>
				<Link href='/admin' className={styles.backLink}>
					<ArrowIcon direction='left' /> Admin console
				</Link>
				<h1>Claims</h1>
				{emailNotice && (
					<p className={styles.notice} role='status'>
						{emailNotice}
					</p>
				)}
				<p className={styles.count}>
					{claims.length} {claims.length === 1 ? 'claim' : 'claims'} waiting
					for review
				</p>

				{claims.length === 0 ?
					<div className={styles.empty}>
						<p>No pending claims.</p>
					</div>
				:	<ul className={styles.claimList}>
						{claims.map((claim) => (
							<li key={claim.id} className={styles.claimCard}>
								<div className={styles.claimHeader}>
									<Link
										href={`/teams/${claim.team.id}`}
										className={styles.claimTeam}
									>
										{claim.team.name}
									</Link>
									<time dateTime={claim.createdAt.toISOString()}>
										{formatSubmittedDate(claim.createdAt)}
									</time>
								</div>
								<dl className={styles.claimMeta}>
									<div>
										<dt>Claimed by</dt>
										<dd>
											{formatSubmitter(claim.user)}
											{' · '}
											<a href={`mailto:${claim.user.email}`}>
												{claim.user.email}
											</a>
										</dd>
									</div>
									<div>
										<dt>Current owner</dt>
										<dd>
											{claim.team.submittedBy ?
												formatSubmitter(claim.team.submittedBy)
											:	'None'}
										</dd>
									</div>
								</dl>
								<p className={styles.claimMessage}>{claim.message}</p>
								<ClaimReviewButtons
									claimId={claim.id}
									teamName={claim.team.name}
								/>
							</li>
						))}
					</ul>
				}
			</div>
		</div>
	);
}
