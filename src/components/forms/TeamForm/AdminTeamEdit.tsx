'use client';

import { useRouter } from 'next/navigation';
import { teamPath } from '@/lib/teamPaths';
import type { TeamFormValues } from '@/lib/types';
import { adminAPI } from '@/services/api';
import { TeamForm } from './TeamForm';

interface AdminTeamEditProps {
	teamId: string;
	initialValues: TeamFormValues;
	initialVerified: boolean;
}

export function AdminTeamEdit({
	teamId,
	initialValues,
	initialVerified,
}: AdminTeamEditProps) {
	const router = useRouter();

	return (
		<TeamForm
			mode='edit'
			initialValues={initialValues}
			initialVerified={initialVerified}
			excludeTeamId={teamId}
			cancelHref={teamPath({ id: teamId, type: initialValues.type })}
			onSubmit={async (payload) => {
				await adminAPI.updateTeam(teamId, payload);
				router.push(teamPath({ id: teamId, type: initialValues.type }));
				router.refresh();
			}}
		/>
	);
}
