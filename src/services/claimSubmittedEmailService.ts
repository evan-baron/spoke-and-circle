import { getSiteUrl, SUPPORT_EMAIL } from '@/lib/siteConfig';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';

interface ClaimSubmittedEmail {
	teamName: string;
	claimantFirstName?: string | null;
	claimantLastName?: string | null;
	claimantEmail: string;
	message: string;
}

export async function sendClaimSubmittedEmail({
	teamName,
	claimantFirstName,
	claimantLastName,
	claimantEmail,
	message,
}: ClaimSubmittedEmail): Promise<EmailStatus> {
	const team = toSingleLine(teamName, 100);
	const claimantName =
		toSingleLine(`${claimantFirstName ?? ''} ${claimantLastName ?? ''}`, 100) ||
		'Unknown';

	return sendMail({
		to: SUPPORT_EMAIL,
		replyTo: claimantEmail,
		subject: `New claim: ${team}`,
		text: [
			'New group claim submitted on Spoke & Circle',
			'',
			`Group: ${team}`,
			`Claimant: ${claimantName}`,
			`Email: ${claimantEmail}`,
			'',
			'Message:',
			message,
			'',
			`Review it: ${getSiteUrl()}/admin/claims`,
		].join('\n'),
		limits: { global: 'email-contact-global' },
	});
}
