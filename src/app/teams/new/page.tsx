import { NewTeamForm } from '@/components/NewTeamForm/NewTeamForm';
import { toGroupRideFormValues } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import { clubTypeFromDb } from '@/lib/teamEnums';
import type { TeamFormValues } from '@/lib/types';
import { getCurrentUser } from '@/services/currentUserService';

async function getGroupRideDefaults(
	sourceTeamId: string | undefined,
): Promise<TeamFormValues | undefined> {
	if (!sourceTeamId) return undefined;

	const user = await getCurrentUser();
	if (!user) return undefined;

	const team = await prisma.team.findFirst({
		where: {
			id: sourceTeamId,
			status: 'Approved',
			...(user.isAdmin ? {} : { submittedById: user.id }),
		},
	});
	if (!team || clubTypeFromDb[team.type] === 'Group Ride') return undefined;

	return toGroupRideFormValues(team);
}

export default async function NewTeamPage({
	searchParams,
}: {
	searchParams: Promise<{ from?: string | string[] }>;
}) {
	const { from } = await searchParams;
	const initialValues = await getGroupRideDefaults(
		typeof from === 'string' ? from : undefined,
	);

	return <NewTeamForm initialValues={initialValues} />;
}
