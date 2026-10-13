import { NextResponse } from 'next/server';
import { jsonValidationError, withPublicRateLimit } from '@/lib/api';
import { readJsonObject } from '@/lib/api/readJsonObject';
import { consentLogSchema } from '@/lib/consentValidation';
import { recordConsentEvent } from '@/services/consentLogService';

const MAX_BODY_BYTES = 1024;

export const POST = withPublicRateLimit('consent-log', async (request) => {
	const result = await readJsonObject(request, { maxBytes: MAX_BODY_BYTES });
	if ('error' in result) return result.error;

	const parsed = consentLogSchema.safeParse(result.body);
	if (!parsed.success) return jsonValidationError(parsed.error);

	await recordConsentEvent(parsed.data);
	return NextResponse.json({ success: true }, { status: 201 });
});
