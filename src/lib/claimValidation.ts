import { z } from 'zod';

export const claimSchema = z.object({
	message: z
		.string()
		.trim()
		.min(20, 'Please give us at least 20 characters of detail')
		.max(2000, 'Message must be less than 2000 characters'),
});

export const claimRejectionReasonSchema = z
	.string()
	.trim()
	.min(1, 'Please explain why the claim is being rejected')
	.max(1000, 'Reason must be less than 1000 characters');

export const claimReviewSchema = z.discriminatedUnion('action', [
	z.object({ action: z.literal('approve') }),
	z.object({ action: z.literal('reject'), reason: claimRejectionReasonSchema }),
]);

export type ClaimInput = z.infer<typeof claimSchema>;
export type ClaimReviewInput = z.infer<typeof claimReviewSchema>;
