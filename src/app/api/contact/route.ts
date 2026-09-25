import { NextResponse } from 'next/server';
import {
	json400,
	json500,
	jsonError,
	jsonValidationError,
	withPublicRateLimit,
} from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { contactSchema } from '@/lib/contactValidation';
import { isAntiBotAnswerCorrect } from '@/lib/data/mathQuestions';
import { antiBotSchema } from '@/lib/validation';
import { sendContactMessage } from '@/services/contactEmailService';

const MAX_BODY_BYTES = 20 * 1024;

export const POST = withPublicRateLimit('contact-form', async (request) => {
	const result = await readJsonObject(request, { maxBytes: MAX_BODY_BYTES });
	if ('error' in result) return result.error;

	const { antibot, antibotIndex, website, ...fields } = result.body;

	if (typeof website === 'string' && website.trim() !== '') {
		return NextResponse.json({ success: true }, { status: 201 });
	}

	const antiBot = antiBotSchema.safeParse({ antibot, antibotIndex });
	if (
		!antiBot.success ||
		!isAntiBotAnswerCorrect(antiBot.data.antibotIndex, antiBot.data.antibot)
	) {
		return json400('Failed anti-bot check');
	}

	const parsed = contactSchema.safeParse(fields);
	if (!parsed.success) return jsonValidationError(parsed.error);

	const status = await sendContactMessage(parsed.data);

	if (status === 'sent') {
		return NextResponse.json({ success: true }, { status: 201 });
	}
	if (status === 'throttled') {
		return jsonError(
			'Too many messages right now. Please try again later.',
			429,
		);
	}

	console.error(`Contact message not sent (${status})`);
	return json500('We could not send your message. Please try again later.');
});
