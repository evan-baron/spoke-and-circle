import { NextResponse } from 'next/server';
import { json400, json404, jsonError, jsonValidationError, withAuth } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { claimReviewSchema } from '@/lib/claimValidation';
import { reviewClaim } from '@/services/teamClaimService';

export const PUT = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request, admin, params) => {
		const claimId = typeof params?.claimId === 'string' ? params.claimId : '';
		if (!claimId) return json400('Invalid claim id');

		const result = await readJsonObject(request);
		if ('error' in result) return result.error;

		const parsed = claimReviewSchema.safeParse(result.body);
		if (!parsed.success) return jsonValidationError(parsed.error);

		const outcome = await reviewClaim(claimId, parsed.data, admin.id);

		switch (outcome.status) {
			case 'claim_not_found':
				return json404('Pending claim not found');
			case 'not_claimable':
				return jsonError(
					'This group now has an owner, so it can no longer be claimed',
					409,
				);
			case 'rejected':
			case 'approved':
				return NextResponse.json({
					success: true,
					emailStatus: outcome.emailStatus,
				});
		}
	},
);
