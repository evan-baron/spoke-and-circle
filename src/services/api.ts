import type {
	CreateTeamResponse,
	LocationsResponse,
	TeamsResponse,
} from '@/lib/types';
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
	create: (payload: unknown) =>
		apiCall<CreateTeamResponse>('/api/teams', {
			method: 'POST',
			body: JSON.stringify(payload),
		}),
};

export const adminAPI = {
	approveTeam: (id: string, payload: unknown) =>
		apiCall<{ success: boolean; emailStatus: string }>(
			`/api/admin/teams/${encodeURIComponent(id)}/approve`,
			{ method: 'POST', body: JSON.stringify(payload) },
		),
	rejectTeam: (id: string, reason?: string) =>
		apiCall<{ success: boolean; emailStatus: string }>(
			`/api/admin/teams/${encodeURIComponent(id)}`,
			{ method: 'DELETE', body: JSON.stringify({ reason }) },
		),
};

export const contactAPI = {
	send: (payload: unknown) =>
		apiCall<{ success: boolean }>('/api/contact', {
			method: 'POST',
			body: JSON.stringify(payload),
		}),
};

export const locationAPI = {
	search: (
		query: string,
		signal?: AbortSignal,
		options: { includeZip?: boolean } = {},
	) =>
		apiCall<LocationsResponse>(
			`/api/locations?q=${encodeURIComponent(query)}${options.includeZip ? '&zip=1' : ''}`,
			{ method: 'GET', signal },
		),
};
