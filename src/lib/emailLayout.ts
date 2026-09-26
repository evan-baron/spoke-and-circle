import { getSiteUrl } from '@/lib/siteConfig';

export const EMAIL_COLORS = {
	ink: '#2d1d30',
	inkSoft: '#6e6374',
	paper: '#fbf8f4',
	line: '#ebe0e6',
	coral: '#e75a50',
	gold: '#f6bb5a',
	ctaEnd: '#f4aa34',
	onGradient: '#fcfaf8',
};

export const FONT_STACK =
	"'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export const paragraphStyle = `margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:1.6;color:${EMAIL_COLORS.ink};`;

export function renderParagraph(html: string, extraStyle = ''): string {
	return `<p style="${paragraphStyle}${extraStyle}">${html}</p>`;
}

export function renderButton(label: string, href: string): string {
	const safeHref = escapeHtml(href);
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
<tr>
<td bgcolor="${EMAIL_COLORS.coral}" style="border-radius:999px;background-color:${EMAIL_COLORS.coral};background-image:linear-gradient(120deg,${EMAIL_COLORS.coral},${EMAIL_COLORS.ctaEnd});">
<a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:15px;font-weight:700;color:${EMAIL_COLORS.onGradient};text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
</td>
</tr>
</table>`;
}

export function renderEmailLayout({
	title,
	bodyHtml,
	footerHtml,
}: {
	title: string;
	bodyHtml: string;
	footerHtml: string;
}): string {
	const headerUrl = escapeHtml(`${getSiteUrl()}/email/header.png`);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.paper};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_COLORS.paper};">
<tr>
<td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:${EMAIL_COLORS.paper};border:1px solid ${EMAIL_COLORS.line};border-radius:16px;overflow:hidden;">
<tr>
<td background="${headerUrl}" bgcolor="${EMAIL_COLORS.coral}" style="background-color:${EMAIL_COLORS.coral};background-image:url('${headerUrl}');background-size:cover;background-position:left center;padding:44px 32px;">
<span style="font-family:${FONT_STACK};font-size:30px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_COLORS.onGradient};">Spoke<span style="color:${EMAIL_COLORS.gold};">&amp;Circle</span></span>
</td>
</tr>
<tr>
<td style="padding:32px;">
${bodyHtml}
</td>
</tr>
<tr>
<td style="padding:16px 32px 24px;border-top:1px solid ${EMAIL_COLORS.line};font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${EMAIL_COLORS.inkSoft};">
${footerHtml}
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}
