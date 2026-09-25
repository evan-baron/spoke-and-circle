'use client';

import { useIsAdmin } from '@/contexts/CurrentUserContext';

interface AdminOnlyProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
	const isAdmin = useIsAdmin();
	return <>{isAdmin ? children : fallback}</>;
}
