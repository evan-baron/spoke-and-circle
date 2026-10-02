import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { TeamListPage } from '@/lib/types';
import { adminAPI } from '@/services/api';

const ADMIN_TEAMS_STALE_MS = 30 * 1000;

export const useAdminTeams = (
	queryString: string,
	initialPage: TeamListPage,
	initialPageLoadedAt: number,
) => {
	return useQuery<TeamListPage>({
		queryKey: queryKeys.admin.teams(queryString),
		queryFn: async () => {
			const { teams, total, page, pageCount } =
				await adminAPI.listTeams(queryString);
			return { teams, total, page, pageCount };
		},
		initialData: initialPage,
		initialDataUpdatedAt: initialPageLoadedAt,
		staleTime: ADMIN_TEAMS_STALE_MS,
	});
};

export const useInvalidateAdminTeams = () => {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.teamsRoot() });
};
