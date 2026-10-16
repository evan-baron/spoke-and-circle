'use client';

import { useRouter } from 'next/navigation';
import { teamPath } from '@/lib/teamPaths';
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
			cancelHref={teamPath({ id: teamId, type: initialValues.type })}
			onSubmit={async (payload) => {
				await teamAPI.update(teamId, payload);
				router.push(teamPath({ id: teamId, type: initialValues.type }));
				router.refresh();
			}}
		/>
	);
}
