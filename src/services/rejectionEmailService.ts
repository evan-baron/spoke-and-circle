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

const COLORS = {
	ink: '#2d1d30',
	inkSoft: '#6e6374',
	paper: '#fbf8f4',
	line: '#ebe0e6',
	coral: '#e75a50',
	gold: '#f6bb5a',
	onGradient: '#fcfaf8',
};

const FONT_STACK =
	"'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function getHeaderImageUrl(): string {
	const base = (process.env.APP_BASE_URL ?? 'https://spokeandcircle.com').replace(
		/\/+$/,
		'',
	);
	return `${base}/email/header.png`;
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
	const headerUrl = escapeHtml(getHeaderImageUrl());
	const paragraph = `margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:1.6;color:${COLORS.ink};`;

	const reasonBlock =
		reason ?
			`<p style="${paragraph}font-weight:700;margin-bottom:8px;">Note from our reviewer</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr>
<td valign="top" style="padding:0 10px 0 4px;font-family:${FONT_STACK};font-size:18px;line-height:1.6;color:${COLORS.coral};">&bull;</td>
<td valign="top" style="font-family:${FONT_STACK};font-size:16px;line-height:1.6;color:${COLORS.ink};">${escapeHtml(reason).replace(/\n/g, '<br>')}</td>
</tr>
</table>`
		:	'';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Update on your Spoke &amp; Circle submission</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.paper};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.paper};">
<tr>
<td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:${COLORS.paper};border:1px solid ${COLORS.line};border-radius:16px;overflow:hidden;">
<tr>
<td background="${headerUrl}" bgcolor="${COLORS.coral}" style="background-color:${COLORS.coral};background-image:url('${headerUrl}');background-size:cover;background-position:left center;padding:44px 32px;">
<span style="font-family:${FONT_STACK};font-size:30px;font-weight:800;letter-spacing:-0.02em;color:${COLORS.onGradient};">Spoke<span style="color:${COLORS.gold};">&amp;Circle</span></span>
</td>
</tr>
<tr>
<td style="padding:32px;">
<p style="${paragraph}">${escapeHtml(greeting)}</p>
<p style="${paragraph}">Thank you for submitting &ldquo;${escapeHtml(team)}&rdquo; to Spoke &amp; Circle. After reviewing it, we&rsquo;re not able to add it to the directory right now.</p>
${reasonBlock}
<p style="${paragraph}">If you&rsquo;d like to make changes and submit again, you&rsquo;re welcome to. Just reply to this email if you have any questions.</p>
<p style="${paragraph}margin-bottom:0;">The Spoke &amp; Circle team</p>
</td>
</tr>
<tr>
<td style="padding:16px 32px 24px;border-top:1px solid ${COLORS.line};font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${COLORS.inkSoft};">
You&rsquo;re receiving this because you submitted a group to the Spoke &amp; Circle directory.
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
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
		sentByAdminId,
	});
}
