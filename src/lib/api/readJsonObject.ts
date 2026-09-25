import type { NextRequest, NextResponse } from 'next/server';
import { json400, jsonError } from './responses';

const DEFAULT_MAX_BYTES = 100 * 1024;

type JsonObjectResult =
	| { body: Record<string, unknown> }
	| { error: NextResponse };

export async function readJsonObject(
	request: NextRequest,
	options: { maxBytes?: number; allowEmpty?: boolean } = {},
): Promise<JsonObjectResult> {
	const { maxBytes = DEFAULT_MAX_BYTES, allowEmpty = false } = options;
	const declaredLength = Number(request.headers.get('content-length') ?? 0);
	if (declaredLength > maxBytes) {
		return { error: jsonError('Request body is too large', 413) };
	}

	let body: unknown;
	try {
		const raw = await request.text();
		if (raw.length > maxBytes) {
			return { error: jsonError('Request body is too large', 413) };
		}
		if (allowEmpty && raw.trim() === '') return { body: {} };
		body = JSON.parse(raw);
	} catch {
		return { error: json400('Request body must be valid JSON') };
	}

	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return { error: json400('Request body must be a JSON object') };
	}

	return { body: body as Record<string, unknown> };
}
