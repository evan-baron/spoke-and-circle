import { prisma } from '@/lib/prisma';
import { resolveLocationDetails } from '@/services/placeService';

export async function syncAdditionalPlaces(
	teamId: string,
	labels: string[],
): Promise<void> {
	const rows = [];
	for (const label of new Set(labels)) {
		const details = await resolveLocationDetails(label);
		if (details) rows.push({ teamId, label, ...details });
	}

	await prisma.$transaction([
		prisma.teamLocation.deleteMany({ where: { teamId } }),
		prisma.teamLocation.createMany({ data: rows }),
	]);
}
