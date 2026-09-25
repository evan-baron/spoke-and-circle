'use client';

import { useRouter } from 'next/navigation';
import type { TeamFormValues } from '@/lib/types';
import { adminAPI } from '@/services/api';
import { TeamForm } from './TeamForm';

interface PendingTeamReviewProps {
	teamId: string;
	initialValues: TeamFormValues;
	submitter: { name: string; email: string } | null;
}

export function PendingTeamReview({
	teamId,
	initialValues,
	submitter,
}: PendingTeamReviewProps) {
	const router = useRouter();

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
			submitter={submitter}
			onSubmit={async (payload) => {
				const { emailStatus } = await adminAPI.approveTeam(teamId, payload);
				backToList('approved', emailStatus);
			}}
			onReject={async (reason) => {
				const { emailStatus } = await adminAPI.rejectTeam(teamId, reason);
				backToList('rejected', emailStatus);
			}}
		/>
	);
}
