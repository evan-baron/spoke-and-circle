import type { ClaimReviewInput } from '@/lib/claimValidation';
import { prisma } from '@/lib/prisma';
import { sendClaimRejectionEmail } from '@/services/claimRejectionEmailService';
import { transferTeamOwnership } from '@/services/teamAdminService';
import { countPendingTeams } from '@/services/teamService';
import type { EmailStatus } from '@/services/mailService';

const claimableTeamWhere = {
	status: 'Approved' as const,
	OR: [{ submittedById: null }, { submittedBy: { role: 'admin' as const } }],
};

export interface ClaimState {
	claimable: boolean;
	hasPendingClaim: boolean;
}

export async function getClaimState(
	teamId: string,
	userId?: number,
): Promise<ClaimState> {
	const [claimable, pending] = await Promise.all([
		prisma.team.count({ where: { id: teamId, ...claimableTeamWhere } }),
		userId === undefined ? 0 : (
			prisma.teamClaim.count({
				where: { teamId, userId, status: 'Pending' },
			})
		),
	]);
	return { claimable: claimable > 0, hasPendingClaim: pending > 0 };
}

export type CreateClaimResult =
	| 'created'
	| 'team_not_found'
	| 'not_claimable'
	| 'already_pending';

export async function createClaim(
	teamId: string,
	userId: number,
	message: string,
): Promise<CreateClaimResult> {
	const team = await prisma.team.findFirst({
		where: { id: teamId, status: 'Approved' },
		select: { id: true },
	});
	if (!team) return 'team_not_found';

	const { claimable, hasPendingClaim } = await getClaimState(teamId, userId);
	if (!claimable) return 'not_claimable';
	if (hasPendingClaim) return 'already_pending';

	await prisma.teamClaim.create({ data: { teamId, userId, message } });
	return 'created';
}

export function countPendingClaims(): Promise<number> {
	return prisma.teamClaim.count({ where: { status: 'Pending' } });
}

export async function countAdminNotifications(): Promise<number> {
	const [teams, claims] = await Promise.all([
		countPendingTeams(),
		countPendingClaims(),
	]);
	return teams + claims;
}

export function listPendingClaims() {
	return prisma.teamClaim.findMany({
		where: { status: 'Pending' },
		orderBy: { createdAt: 'asc' },
		take: 200,
		select: {
			id: true,
			message: true,
			createdAt: true,
			user: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
			team: {
				select: {
					id: true,
					name: true,
					submittedBy: {
						select: { firstName: true, lastName: true, email: true },
					},
				},
			},
		},
	});
}

export type ReviewClaimResult =
	| { status: 'claim_not_found' | 'not_claimable' }
	| { status: 'rejected'; emailStatus: EmailStatus }
	| { status: 'approved'; emailStatus: EmailStatus };

export async function reviewClaim(
	claimId: string,
	review: ClaimReviewInput,
	adminId: number,
): Promise<ReviewClaimResult> {
	const claim = await prisma.teamClaim.findFirst({
		where: { id: claimId, status: 'Pending' },
		select: {
			id: true,
			teamId: true,
			userId: true,
			user: { select: { email: true, firstName: true } },
			team: { select: { name: true } },
		},
	});
	if (!claim) return { status: 'claim_not_found' };

	const reviewedAt = new Date();

	if (review.action === 'reject') {
		await prisma.teamClaim.update({
			where: { id: claim.id },
			data: { status: 'Rejected', reviewedAt },
		});

		try {
			const emailStatus = await sendClaimRejectionEmail({
				to: claim.user.email,
				firstName: claim.user.firstName,
				teamName: claim.team.name,
				reason: review.reason,
				sentByAdminId: adminId,
			});
			return { status: 'rejected', emailStatus };
		} catch (error) {
			console.error('Failed to send claim rejection email:', error);
			return { status: 'rejected', emailStatus: 'failed' };
		}
	}

	const { claimable } = await getClaimState(claim.teamId);
	if (!claimable) return { status: 'not_claimable' };

	const transfer = await transferTeamOwnership(
		claim.teamId,
		claim.userId,
		adminId,
	);
	if (transfer.status !== 'transferred') return { status: 'not_claimable' };

	await prisma.$transaction([
		prisma.teamClaim.update({
			where: { id: claim.id },
			data: { status: 'Approved', reviewedAt },
		}),
		prisma.teamClaim.updateMany({
			where: { teamId: claim.teamId, status: 'Pending' },
			data: { status: 'Rejected', reviewedAt },
		}),
	]);

	return { status: 'approved', emailStatus: transfer.emailStatus };
}
