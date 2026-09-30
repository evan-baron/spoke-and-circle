'use client';

import { useRouter } from 'next/navigation';
import type { TeamFormValues } from '@/lib/types';
import { teamAPI } from '@/services/api';
import { TeamForm } from './TeamForm';

interface OwnerTeamEditProps {
	teamId: string;
	initialValues: TeamFormValues;
}

export function OwnerTeamEdit({ teamId, initialValues }: OwnerTeamEditProps) {
	const router = useRouter();

	return (
		<TeamForm
			mode='edit'
			initialValues={initialValues}
			excludeTeamId={teamId}
			showAdminFields={false}
			onSubmit={async (payload) => {
				await teamAPI.update(teamId, payload);
				router.push(`/teams/${teamId}`);
				router.refresh();
			}}
		/>
	);
}
