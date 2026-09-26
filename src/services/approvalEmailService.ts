import {
	escapeHtml,
	renderButton,
	renderEmailLayout,
	renderParagraph,
} from '@/lib/emailLayout';
import { getSiteUrl } from '@/lib/siteConfig';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';

interface ApprovalEmail {
	to: string;
	firstName?: string | null;
	teamName: string;
	teamId: string;
	sentByAdminId: number;
}

export function buildApprovalEmailHtml({
	greeting,
	team,
	teamUrl,
}: {
	greeting: string;
	team: string;
	teamUrl: string;
}): string {
	const bodyHtml = [
		renderParagraph(escapeHtml(greeting)),
		renderParagraph(
			`Congratulations! &ldquo;${escapeHtml(team)}&rdquo; has been reviewed and approved, and it&rsquo;s now live in the Spoke &amp; Circle directory. Riders looking for a group like yours can find it in search.`,
		),
		renderButton('View your group', teamUrl),
		renderParagraph(
			'Thanks for helping riders find their circle. Just reply to this email if you have any questions.',
		),
		renderParagraph('The Spoke &amp; Circle team', 'margin-bottom:0;'),
	].join('\n');

	return renderEmailLayout({
		title: 'Your group is live on Spoke & Circle',
		bodyHtml,
		footerHtml:
			'You&rsquo;re receiving this because you submitted a group to the Spoke &amp; Circle directory.',
	});
}

export async function sendApprovalEmail({
	to,
	firstName,
	teamName,
	teamId,
	sentByAdminId,
}: ApprovalEmail): Promise<EmailStatus> {
	const name = firstName ? toSingleLine(firstName, 50) : '';
	const team = toSingleLine(teamName, 100);
	const greeting = name ? `Hi ${name},` : 'Hi,';
	const teamUrl = `${getSiteUrl()}/teams/${encodeURIComponent(teamId)}`;

	const lines = [
		greeting,
		'',
		`Congratulations! "${team}" has been reviewed and approved, and it's now live in the Spoke & Circle directory. Riders looking for a group like yours can find it in search.`,
		'',
		`View your group: ${teamUrl}`,
		'',
		'Thanks for helping riders find their circle. Just reply to this email if you have any questions.',
		'',
		'The Spoke & Circle team',
	];

	return sendMail({
		to,
		subject: 'Congratulations! Your group is now on Spoke & Circle',
		text: lines.join('\n'),
		html: buildApprovalEmailHtml({ greeting, team, teamUrl }),
		limits: {
			global: 'email-global',
			adminId: sentByAdminId,
			perRecipient: true,
		},
	});
}
