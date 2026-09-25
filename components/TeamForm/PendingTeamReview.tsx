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

	function backToList() {
		router.push('/admin/pending');
		router.refresh();
	}

	return (
		<TeamForm
			mode='review'
			initialValues={initialValues}
			submitter={submitter}
			onSubmit={async (payload) => {
				await adminAPI.approveTeam(teamId, payload);
				backToList();
			}}
			onReject={async (reason) => {
				await adminAPI.rejectTeam(teamId, reason);
				backToList();
			}}
		/>
	);
}
