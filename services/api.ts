import type { TeamsResponse } from '@/lib/types';
import { ApiError } from '@/services/apiError';

async function parseApiResponse<T>(response: Response): Promise<T> {
	const data = await response.json();

	if (!response.ok) {
		throw new ApiError(
			data.error || `HTTP ${response.status}`,
			response.status,
			data,
		);
	}

	return data as T;
}

const apiCall = async <T = unknown>(
	url: string,
	options: RequestInit = {},
): Promise<T> => {
	const response = await fetch(url, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});

	return parseApiResponse<T>(response);
};

export const teamAPI = {
	read: () => apiCall<TeamsResponse>('/api/teams', { method: 'GET' }),
};
