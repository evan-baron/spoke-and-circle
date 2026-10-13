import { z } from 'zod';

export const consentLogSchema = z.object({
	visitorId: z.uuid(),
	event: z.enum(['Granted', 'Withdrawn']),
	policyVersion: z.string().trim().min(1).max(40),
});

export type ConsentLogInput = z.infer<typeof consentLogSchema>;
