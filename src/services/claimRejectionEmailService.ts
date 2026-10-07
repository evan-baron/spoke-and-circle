import {
	escapeHtml,
	renderEmailLayout,
	renderParagraph,
} from '@/lib/emailLayout';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';
import { renderReasonBlock } from '@/services/rejectionEmailService';

interface ClaimRejectionEmail {
	to: string;
	firstName?: string | null;
	teamName: string;
	reason: string;
	sentByAdminId: number;
}

export function buildClaimRejectionEmailHtml({
	greeting,
	team,
	reason,
}: {
	greeting: string;
	team: string;
	reason: string;
}): string {
	const bodyHtml = [
		renderParagraph(escapeHtml(greeting)),
		renderParagraph(
			`Thank you for your request to claim &ldquo;${escapeHtml(team)}&rdquo; on Spoke &amp; Circle. After reviewing it, we&rsquo;re not able to transfer ownership of this group to you right now.`,
		),
		renderReasonBlock(reason),
		renderParagraph(
			'If you have more information that shows you run this group, you&rsquo;re welcome to submit another claim. Just reply to this email if you have any questions.',
		),
		renderParagraph('The Spoke &amp; Circle team', 'margin-bottom:0;'),
	].join('\n');

	return renderEmailLayout({
		title: 'Update on your Spoke & Circle claim',
		bodyHtml,
		footerHtml:
			'You&rsquo;re receiving this because you asked to claim a group on Spoke &amp; Circle.',
	});
}

export async function sendClaimRejectionEmail({
	to,
	firstName,
	teamName,
	reason,
	sentByAdminId,
}: ClaimRejectionEmail): Promise<EmailStatus> {
	const name = firstName ? toSingleLine(firstName, 50) : '';
	const team = toSingleLine(teamName, 100);
	const trimmedReason = reason.trim();
	const greeting = name ? `Hi ${name},` : 'Hi,';

	const lines = [
		greeting,
		'',
		`Thank you for your request to claim "${team}" on Spoke & Circle. After reviewing it, we're not able to transfer ownership of this group to you right now.`,
		'',
		'Note from our reviewer:',
		`• ${trimmedReason}`,
		'',
		"If you have more information that shows you run this group, you're welcome to submit another claim. Just reply to this email if you have any questions.",
		'',
		'The Spoke & Circle team',
	];

	return sendMail({
		to,
		subject: 'Update on your Spoke & Circle claim',
		text: lines.join('\n'),
		html: buildClaimRejectionEmailHtml({
			greeting,
			team,
			reason: trimmedReason,
		}),
		limits: {
			global: 'email-global',
			adminId: sentByAdminId,
			perRecipient: true,
		},
	});
}
