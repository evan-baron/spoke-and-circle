import { z } from 'zod';
import { contactSchema } from '@/lib/contactValidation';

export const feedbackSchema = z.object({
	name: z
		.string()
		.trim()
		.max(100, 'Name must be less than 100 characters')
		.optional(),
	email: contactSchema.shape.email,
	description: z
		.string()
		.trim()
		.min(10, 'Description must be at least 10 characters')
		.max(5000, 'Description must be less than 5000 characters'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
