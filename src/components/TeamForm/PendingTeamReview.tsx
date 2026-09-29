'use client';

import { useRouter } from 'next/navigation';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import type { TeamFormValues } from '@/lib/types';
import { adminAPI } from '@/services/api';
import { TeamForm } from './TeamForm';

interface PendingTeamReviewProps {
	teamId: string;
	initialValues: TeamFormValues;
	initialVerified: boolean;
	submitter: { name: string; email: string } | null;
}

export function PendingTeamReview({
	teamId,
	initialValues,
	initialVerified,
	submitter,
}: PendingTeamReviewProps) {
	const router = useRouter();
	const invalidatePendingCount = useInvalidatePendingTeamCount();

	function backToList(outcome: 'approved' | 'rejected', emailStatus?: string) {
		const query =
			emailStatus && emailStatus !== 'sent' ?
				`?outcome=${outcome}&emailStatus=${encodeURIComponent(emailStatus)}`
			:	'';
		router.push(`/admin/pending${query}`);
		router.refresh();
	}

	return (
		<TeamForm
			mode='review'
			initialValues={initialValues}
			initialVerified={initialVerified}
			submitter={submitter}
			excludeTeamId={teamId}
			onSubmit={async (payload) => {
				const { emailStatus } = await adminAPI.approveTeam(teamId, payload);
				await invalidatePendingCount();
				backToList('approved', emailStatus);
			}}
			onReject={async (reason) => {
				const { emailStatus } = await adminAPI.rejectTeam(teamId, reason);
				await invalidatePendingCount();
				backToList('rejected', emailStatus);
			}}
		/>
	);
}
