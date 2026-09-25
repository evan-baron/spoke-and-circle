import { z } from 'zod';

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	email: z
		.string()
		.trim()
		.min(1, 'Email is required')
		.max(254, 'Email must be less than 254 characters')
		.pipe(z.email('Enter a valid email address')),
	message: z
		.string()
		.trim()
		.min(10, 'Message must be at least 10 characters')
		.max(5000, 'Message must be less than 5000 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;
