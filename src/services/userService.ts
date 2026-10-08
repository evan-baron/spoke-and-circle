import type { User as Auth0User } from '@auth0/nextjs-auth0/types';
import { isMissingName } from '@/lib/format';
import { prisma } from '@/lib/prisma';

function extractNames(user: Auth0User) {
	let firstName: string | null = user.given_name ?? null;
	let lastName: string | null = user.family_name ?? null;

	if (!firstName && !lastName && user.name && !user.name.includes('@')) {
		const nameParts = user.name.trim().split(' ');
		if (nameParts.length >= 2) {
			firstName = nameParts[0] ?? null;
			lastName = nameParts.slice(1).join(' ');
		} else if (nameParts.length === 1) {
			firstName = nameParts[0] ?? null;
		}
	}

	return { firstName, lastName };
}

export async function findOrCreateUser(user: Auth0User) {
	if (!user.email) {
		throw new Error('Auth0 user has no email address');
	}

	const { firstName, lastName } = extractNames(user);
	const userData = {
		auth0Id: user.sub,
		email: user.email,
		firstName,
		lastName,
	};

	let existingUser = await prisma.user.findUnique({
		where: { auth0Id: user.sub },
	});

	if (!existingUser && user.email_verified) {
		existingUser = await prisma.user.findUnique({
			where: { email: user.email },
		});
	}

	if (existingUser) {
		const updateData = {
			...(user.email_verified ?
				{ auth0Id: userData.auth0Id, email: userData.email }
			:	{}),
			...(isMissingName(existingUser.firstName) && firstName ?
				{ firstName }
			:	{}),
			...(!existingUser.lastName && lastName ? { lastName } : {}),
		};

		const unchanged = Object.entries(updateData).every(
			([key, value]) =>
				existingUser[key as keyof typeof existingUser] === value,
		);
		if (unchanged) return existingUser;

		return prisma.user.update({
			where: { id: existingUser.id },
			data: updateData,
		});
	}

	return prisma.user.create({ data: userData });
}

export function updateUserName(
	id: string,
	firstName: string,
	lastName: string | null,
) {
	return prisma.user.update({
		where: { id },
		data: { firstName, lastName },
		select: { firstName: true, lastName: true },
	});
}
