import { prisma } from '@/lib/prisma';
import type { ConsentLogInput } from '@/lib/consentValidation';

const RETENTION_YEARS = 4;
const CLEANUP_PROBABILITY = 0.01;

async function deleteExpiredConsentLogs() {
	const cutoff = new Date();
	cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS);
	await prisma.cookieConsentLog.deleteMany({
		where: { createdAt: { lt: cutoff } },
	});
}

export async function recordConsentEvent(input: ConsentLogInput) {
	await prisma.cookieConsentLog.create({ data: input });

	if (Math.random() < CLEANUP_PROBABILITY) {
		void deleteExpiredConsentLogs().catch((error) => {
			console.error('Consent log cleanup failed:', error);
		});
	}
}
