import { toApprovedTeamUpdate } from '@/lib/api/teamMapper';
import { prisma } from '@/lib/prisma';
import type { CreateTeamInput } from '@/lib/validation';
import { sendApprovalEmail } from '@/services/approvalEmailService';
import type { EmailStatus } from '@/services/mailService';
import { syncAdditionalPlaces } from '@/services/teamLocationService';
import { resolveCoordinates } from '@/services/placeService';
import { sendRejectionEmail } from '@/services/rejectionEmailService';

export async function approvePendingTeam(
	id: string,
	adminId: number,
	input: CreateTeamInput,
): Promise<{ emailStatus: EmailStatus } | null> {
	const pending = await prisma.team.findFirst({
		where: { id, status: 'Pending' },
		select: { submittedBy: { select: { email: true, firstName: true } } },
	});
	if (!pending) return null;

	const result = await prisma.team.updateMany({
		where: { id, status: 'Pending' },
		data: {
			...toApprovedTeamUpdate(input),
			...((await resolveCoordinates(input.location)) ?? {
				latitude: null,
				longitude: null,
			}),
		},
	});
	if (result.count === 0) return null;

	try {
		await syncAdditionalPlaces(id, input.additionalLocations ?? []);
	} catch (error) {
		console.error('Error saving additional locations:', error);
	}

	if (!pending.submittedBy) return { emailStatus: 'no_recipient' };

	try {
		const emailStatus = await sendApprovalEmail({
			to: pending.submittedBy.email,
			firstName: pending.submittedBy.firstName,
			teamName: input.name,
			teamId: id,
			sentByAdminId: adminId,
		});
		return { emailStatus };
	} catch (error) {
		console.error('Failed to send approval email:', error);
		return { emailStatus: 'failed' };
	}
}

export async function rejectPendingTeam(
	id: string,
	adminId: number,
	reason?: string,
): Promise<{ emailStatus: EmailStatus } | null> {
	const team = await prisma.team.findFirst({
		where: { id, status: 'Pending' },
		select: {
			name: true,
			submittedBy: { select: { email: true, firstName: true } },
		},
	});
	if (!team) return null;

	const result = await prisma.team.deleteMany({
		where: { id, status: 'Pending' },
	});
	if (result.count === 0) return null;

	if (!team.submittedBy) return { emailStatus: 'no_recipient' };

	try {
		const emailStatus = await sendRejectionEmail({
			to: team.submittedBy.email,
			firstName: team.submittedBy.firstName,
			teamName: team.name,
			reason,
			sentByAdminId: adminId,
		});
		return { emailStatus };
	} catch (error) {
		console.error('Failed to send rejection email:', error);
		return { emailStatus: 'failed' };
	}
}
