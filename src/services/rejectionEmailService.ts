import {
	EMAIL_COLORS,
	escapeHtml,
	FONT_STACK,
	paragraphStyle,
	renderEmailLayout,
	renderParagraph,
} from '@/lib/emailLayout';
import {
	type EmailStatus,
	sendMail,
	toSingleLine,
} from '@/services/mailService';

interface RejectionEmail {
	to: string;
	firstName?: string | null;
	teamName: string;
	reason?: string;
	sentByAdminId: number;
}

export function buildRejectionEmailHtml({
	greeting,
	team,
	reason,
}: {
	greeting: string;
	team: string;
	reason?: string;
}): string {
	const reasonBlock =
		reason ?
			`<p style="${paragraphStyle}font-weight:700;margin-bottom:8px;">Note from our reviewer</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr>
<td valign="top" style="padding:0 10px 0 4px;font-family:${FONT_STACK};font-size:18px;line-height:1.6;color:${EMAIL_COLORS.coral};">&bull;</td>
<td valign="top" style="font-family:${FONT_STACK};font-size:16px;line-height:1.6;color:${EMAIL_COLORS.ink};">${escapeHtml(reason).replace(/\n/g, '<br>')}</td>
</tr>
</table>`
		:	'';

	const bodyHtml = [
		renderParagraph(escapeHtml(greeting)),
		renderParagraph(
			`Thank you for submitting &ldquo;${escapeHtml(team)}&rdquo; to Spoke &amp; Circle. After reviewing it, we&rsquo;re not able to add it to the directory right now.`,
		),
		reasonBlock,
		renderParagraph(
			'If you&rsquo;d like to make changes and submit again, you&rsquo;re welcome to. Just reply to this email if you have any questions.',
		),
		renderParagraph('The Spoke &amp; Circle team', 'margin-bottom:0;'),
	].join('\n');

	return renderEmailLayout({
		title: 'Update on your Spoke & Circle submission',
		bodyHtml,
		footerHtml:
			'You&rsquo;re receiving this because you submitted a group to the Spoke &amp; Circle directory.',
	});
}

export async function sendRejectionEmail({
	to,
	firstName,
	teamName,
	reason,
	sentByAdminId,
}: RejectionEmail): Promise<EmailStatus> {
	const name = firstName ? toSingleLine(firstName, 50) : '';
	const team = toSingleLine(teamName, 100);
	const trimmedReason = reason?.trim() || undefined;
	const greeting = name ? `Hi ${name},` : 'Hi,';

	const lines = [
		greeting,
		'',
		`Thank you for submitting "${team}" to Spoke & Circle. After reviewing it, we're not able to add it to the directory right now.`,
		...(trimmedReason ? ['', 'Note from our reviewer:', `• ${trimmedReason}`] : []),
		'',
		"If you'd like to make changes and submit again, you're welcome to. Just reply to this email if you have any questions.",
		'',
		'The Spoke & Circle team',
	];

	return sendMail({
		to,
		subject: 'Update on your Spoke & Circle submission',
		text: lines.join('\n'),
		html: buildRejectionEmailHtml({ greeting, team, reason: trimmedReason }),
		limits: {
			global: 'email-global',
			adminId: sentByAdminId,
			perRecipient: true,
		},
	});
}
