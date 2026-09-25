import { createHash } from 'node:crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import type { ContactInput } from '@/lib/contactValidation';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';

const SUPPORT_ADDRESS = 'support@spokeandcircle.com';

function hashAddress(address: string): string {
	return createHash('sha256').update(address.toLowerCase()).digest('hex');
}

export async function sendContactMessage({
	name,
	email,
	message,
}: ContactInput): Promise<EmailStatus> {
	const senderLimit = await checkRateLimit(
		`contact:${hashAddress(email)}`,
		'contact-sender',
		'anonymous',
	);
	if (!senderLimit.success) return 'throttled';

	const senderName = toSingleLine(name, 100);

	return sendMail({
		to: SUPPORT_ADDRESS,
		replyTo: email,
		subject: `Contact form: ${senderName}`,
		text: [
			'New message from the Spoke & Circle contact form',
			'',
			`Name: ${senderName}`,
			`Email: ${email}`,
			'',
			'Message:',
			message,
		].join('\n'),
		limits: { global: 'email-contact-global' },
	});
}
