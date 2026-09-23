import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Team } from '@/lib/types';
import { teamAPI } from '@/services/api';

export const useGetTeams = (initialTeams?: Team[]) => {
	return useQuery<Team[]>({
		queryKey: queryKeys.teams.all(),
		queryFn: async () => {
			const data = await teamAPI.read();
			return data.teams;
		},
		initialData: initialTeams,
	});
};
