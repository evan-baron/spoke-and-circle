import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import type { CurrentUser } from '@/lib/types';
import { findOrCreateUser } from '@/services/userService';

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
	const session = await auth0.getSession();
	if (!session?.user) return null;

	try {
		const user = await findOrCreateUser(session.user);

		return {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isAdmin: user.active && user.role === 'admin',
		};
	} catch (error) {
		console.error('Failed to load current user:', error);
		return null;
	}
});

export async function requireAdmin(): Promise<CurrentUser> {
	const user = await getCurrentUser();
	if (!user?.isAdmin) redirect('/');
	return user;
}
