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

interface TransferEmail {
	to: string;
	firstName?: string | null;
	teamName: string;
	approved: boolean;
	sentByAdminId: number;
}

export function buildTransferEmailHtml({
	greeting,
	team,
	statusNote,
	dashboardUrl,
}: {
	greeting: string;
	team: string;
	statusNote: string;
	dashboardUrl: string;
}): string {
	const bodyHtml = [
		renderParagraph(escapeHtml(greeting)),
		renderParagraph(
			`An admin has transferred ownership of &ldquo;${escapeHtml(team)}&rdquo; to your Spoke &amp; Circle account. ${escapeHtml(statusNote)}`,
		),
		renderButton('Go to your dashboard', dashboardUrl),
		renderParagraph(
			'Please reply to this email if you have any questions or think this was a mistake.',
		),
		renderParagraph('The Spoke &amp; Circle team', 'margin-bottom:0;'),
	].join('\n');

	return renderEmailLayout({
		title: 'A team has been transferred to you on Spoke & Circle',
		bodyHtml,
		footerHtml:
			'You&rsquo;re receiving this because a Spoke &amp; Circle admin transferred a group to your account.',
	});
}

export async function sendTeamTransferEmail({
	to,
	firstName,
	teamName,
	approved,
	sentByAdminId,
}: TransferEmail): Promise<EmailStatus> {
	const name = firstName ? toSingleLine(firstName, 50) : '';
	const team = toSingleLine(teamName, 100);
	const greeting = name ? `Hi ${name},` : 'Hi,';
	const dashboardUrl = `${getSiteUrl()}/dashboard`;
	const statusNote =
		approved ?
			'You can view and edit it from your dashboard.'
		:	'It is still awaiting review, and you can follow its status from your dashboard.';

	const lines = [
		greeting,
		'',
		`An admin has transferred ownership of "${team}" to your Spoke & Circle account. ${statusNote}`,
		'',
		`Go to your dashboard: ${dashboardUrl}`,
		'',
		'Just reply to this email if you have any questions or think this was a mistake.',
		'',
		'The Spoke & Circle team',
	];

	return sendMail({
		to,
		subject: 'A team has been transferred to you on Spoke & Circle',
		text: lines.join('\n'),
		html: buildTransferEmailHtml({ greeting, team, statusNote, dashboardUrl }),
		limits: {
			global: 'email-global',
			adminId: sentByAdminId,
			perRecipient: true,
		},
	});
}
