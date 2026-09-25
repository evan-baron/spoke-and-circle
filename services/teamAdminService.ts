import { toApprovedTeamUpdate } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import type { CreateTeamInput } from '@/lib/validation';
import { sendRejectionEmail } from '@/services/rejectionEmailService';

export async function approvePendingTeam(
	id: string,
	input: CreateTeamInput,
): Promise<boolean> {
	const result = await prisma.team.updateMany({
		where: { id, status: 'Pending' },
		data: toApprovedTeamUpdate(input),
	});
	return result.count > 0;
}

export async function rejectPendingTeam(
	id: string,
	reason?: string,
): Promise<boolean> {
	const team = await prisma.team.findFirst({
		where: { id, status: 'Pending' },
		select: { name: true, submittedBy: { select: { email: true } } },
	});
	if (!team) return false;

	const result = await prisma.team.deleteMany({
		where: { id, status: 'Pending' },
	});
	if (result.count === 0) return false;

	if (team.submittedBy) {
		try {
			await sendRejectionEmail({
				to: team.submittedBy.email,
				teamName: team.name,
				reason,
			});
		} catch (error) {
			console.error('Failed to send rejection email:', error);
		}
	}

	return true;
}
