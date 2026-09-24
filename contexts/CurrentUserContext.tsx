'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/types';

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
	user,
	children,
}: {
	user: CurrentUser | null;
	children: React.ReactNode;
}) {
	return (
		<CurrentUserContext.Provider value={user}>
			{children}
		</CurrentUserContext.Provider>
	);
}

export function useCurrentUser() {
	return useContext(CurrentUserContext);
}

export function useIsAdmin() {
	return useContext(CurrentUserContext)?.isAdmin ?? false;
}
