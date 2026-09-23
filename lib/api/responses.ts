import { NextResponse } from 'next/server';
import { z } from 'zod';

export function jsonError(message: string, status: number) {
	return NextResponse.json({ error: message }, { status });
}

export function json400(message = 'Bad Request') {
	return jsonError(message, 400);
}

export function json401(message = 'Unauthorized') {
	return jsonError(message, 401);
}

export function json403(message = 'Forbidden') {
	return jsonError(message, 403);
}

export function json404(message = 'Not Found') {
	return jsonError(message, 404);
}

export function json500(message = 'Internal Server Error') {
	return jsonError(message, 500);
}

export function jsonValidationError(zodError: z.ZodError) {
	const errors = zodError.issues.map((issue) => ({
		path: issue.path.join('.'),
		message: issue.message,
	}));
	return NextResponse.json(
		{
			error: 'Validation failed',
			details: errors.map((e) => e.message),
			fields: errors,
		},
		{ status: 400 },
	);
}
