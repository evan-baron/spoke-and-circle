import { createHash } from 'node:crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import type { FeedbackInput } from '@/lib/feedbackValidation';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';

const SUPPORT_ADDRESS = 'support@spokeandcircle.com';

function hashAddress(address: string): string {
	return createHash('sha256').update(address.toLowerCase()).digest('hex');
}

export async function sendFeedback({
	name,
	email,
	description,
}: FeedbackInput): Promise<EmailStatus> {
	const senderLimit = await checkRateLimit(
		`feedback:${hashAddress(email)}`,
		'feedback-sender',
		'anonymous',
	);
	if (!senderLimit.success) return 'throttled';

	const senderName = toSingleLine(name ?? '', 100) || 'Anonymous';

	return sendMail({
		to: SUPPORT_ADDRESS,
		replyTo: email,
		subject: `Feedback: ${senderName}`,
		text: [
			'New feedback from the Spoke & Circle feedback form',
			'',
			`Name: ${senderName}`,
			`Email: ${email}`,
			'',
			'Description:',
			description,
		].join('\n'),
		limits: { global: 'email-contact-global' },
	});
}
