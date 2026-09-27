import { ApiError } from '@/services/apiError';

export function describeSubmitError(error: unknown): string[] {
	if (error instanceof ApiError) {
		if (error.status === 429) {
			return ['Too many requests. Please try again later.'];
		}

		const details = (error.responseData as { details?: unknown } | null)
			?.details;
		if (Array.isArray(details)) {
			const messages = details.filter(
				(detail): detail is string => typeof detail === 'string',
			);
			if (messages.length > 0) return messages;
		}

		return [error.message];
	}

	return ['Something went wrong. Please try again.'];
}
