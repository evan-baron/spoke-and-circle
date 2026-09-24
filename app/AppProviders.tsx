'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CurrentUserProvider } from '@/contexts/CurrentUserContext';
import type { CurrentUser } from '@/lib/types';

export default function AppProviders({
	currentUser,
	children,
}: {
	currentUser: CurrentUser | null;
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000,
						gcTime: 10 * 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>
		</QueryClientProvider>
	);
}
