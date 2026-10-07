import { NextResponse } from 'next/server';
import {
	json400,
	json500,
	jsonError,
	jsonValidationError,
	withPublicRateLimit,
} from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { isAntiBotAnswerCorrect } from '@/lib/data/mathQuestions';
import { feedbackSchema } from '@/lib/feedbackValidation';
import { antiBotSchema } from '@/lib/validation';
import { sendFeedback } from '@/services/feedbackEmailService';

const MAX_BODY_BYTES = 20 * 1024;

export const POST = withPublicRateLimit('feedback-form', async (request) => {
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

	const parsed = feedbackSchema.safeParse(fields);
	if (!parsed.success) return jsonValidationError(parsed.error);

	const status = await sendFeedback(parsed.data);

	if (status === 'sent') {
		return NextResponse.json({ success: true }, { status: 201 });
	}
	if (status === 'throttled') {
		return jsonError(
			'Too much feedback right now. Please try again later.',
			429,
		);
	}

	console.error(`Feedback not sent (${status})`);
	return json500('We could not send your feedback. Please try again later.');
});
