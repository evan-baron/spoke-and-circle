import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { adminAPI } from '@/services/api';

export const usePendingTeamCount = (initialCount?: number) => {
	return useQuery<number>({
		queryKey: queryKeys.admin.pendingCount(),
		queryFn: async () => {
			const data = await adminAPI.pendingCount();
			return data.count;
		},
		initialData: initialCount,
		enabled: initialCount !== undefined,
	});
};

export const useInvalidatePendingTeamCount = () => {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.pendingCount(),
		});
};
