import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const FROM_ADDRESS = 'Spoke & Circle <support@spokeandcircle.com>';
const SEND_TIMEOUT_MS = 10_000;
const MAX_SUBJECT_LENGTH = 150;
const MAX_BODY_LENGTH = 5000;
const MAX_HTML_LENGTH = 50_000;

export type EmailStatus =
	| 'sent'
	| 'no_recipient'
	| 'not_configured'
	| 'throttled'
	| 'failed';

interface SendMailInput {
	to: string;
	subject: string;
	text: string;
	html?: string;
	sentByAdminId: number;
}

const recipientSchema = z.email().max(254);

export function toSingleLine(value: string, maxLength: number): string {
	return value
		.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
}

function toBody(value: string): string {
	return value
		.replace(/\r\n?/g, '\n')
		.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
		.slice(0, MAX_BODY_LENGTH);
}

function hashAddress(address: string): string {
	return createHash('sha256').update(address.toLowerCase()).digest('hex');
}

async function isWithinSendLimits(
	to: string,
	sentByAdminId: number,
): Promise<boolean> {
	const checks = [
		await checkRateLimit('email:global', 'email-global', 'admin'),
		await checkRateLimit(`user:${sentByAdminId}`, 'email-admin', 'admin'),
		await checkRateLimit(
			`email:${hashAddress(to)}`,
			'email-recipient',
			'admin',
		),
	];
	return checks.every((check) => check.success);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Email send timed out')), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

export async function sendMail({
	to,
	subject,
	text,
	html,
	sentByAdminId,
}: SendMailInput): Promise<EmailStatus> {
	const recipient = recipientSchema.safeParse(to.trim());
	if (!recipient.success) return 'no_recipient';

	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		const log = process.env.NODE_ENV === 'production' ? console.error : console.warn;
		log('RESEND_API_KEY is not set, email not sent');
		return 'not_configured';
	}

	try {
		if (!(await isWithinSendLimits(recipient.data, sentByAdminId))) {
			return 'throttled';
		}

		const { error } = await withTimeout(
			new Resend(apiKey).emails.send({
				from: FROM_ADDRESS,
				to: recipient.data,
				subject: toSingleLine(subject, MAX_SUBJECT_LENGTH),
				text: toBody(text),
				...(html ? { html: html.slice(0, MAX_HTML_LENGTH) } : {}),
			}),
			SEND_TIMEOUT_MS,
		);

		if (error) {
			console.error('Email provider error:', error.name, error.message);
			return 'failed';
		}
		return 'sent';
	} catch (error) {
		console.error(
			'Email send failed:',
			error instanceof Error ? error.message : 'unknown error',
		);
		return 'failed';
	}
}
