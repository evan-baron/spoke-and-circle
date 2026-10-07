'use client';

import Link from 'next/link';
import { type FormEvent, useId, useRef, useState } from 'react';
import { AntiBot } from '@/components/AntiBot/AntiBot';
import styles from '@/components/ContactForm/contactForm.module.scss';
import formStyles from '@/components/TeamForm/teamForm.module.scss';
import { feedbackSchema } from '@/lib/feedbackValidation';
import { feedbackAPI } from '@/services/api';
import { ApiError } from '@/services/apiError';

type FieldName = 'name' | 'email' | 'description';
type FieldErrors = Partial<Record<FieldName, string>>;

function describeSubmitError(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 429) {
			return 'Too much feedback right now. Please try again later.';
		}
		return error.message;
	}
	return 'Something went wrong. Please try again.';
}

export function FeedbackForm() {
	const nameId = useId();
	const emailId = useId();
	const descriptionId = useId();
	const busyRef = useRef(false);
	const [isAntiBotValid, setIsAntiBotValid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitError, setSubmitError] = useState('');
	const [sent, setSent] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!isAntiBotValid || busyRef.current) return;

		const data = new FormData(event.currentTarget);
		const text = (key: string) => {
			const value = data.get(key);
			return typeof value === 'string' ? value : '';
		};

		const parsed = feedbackSchema.safeParse({
			name: text('name'),
			email: text('email'),
			description: text('description'),
		});

		if (!parsed.success) {
			const errors: FieldErrors = {};
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (
					(field === 'name' || field === 'email' || field === 'description') &&
					!errors[field]
				) {
					errors[field] = issue.message;
				}
			}
			setFieldErrors(errors);
			setSubmitError('');
			return;
		}

		setFieldErrors({});
		setSubmitError('');
		busyRef.current = true;
		setIsSubmitting(true);

		try {
			await feedbackAPI.send({
				...parsed.data,
				website: text('website'),
				antibot: text('antibot'),
				antibotIndex: Number(text('antibotIndex')),
			});
			setSent(true);
		} catch (error) {
			setSubmitError(describeSubmitError(error));
		} finally {
			busyRef.current = false;
			setIsSubmitting(false);
		}
	}

	if (sent) {
		return (
			<div className={`${formStyles.wrap} ${formStyles.confirmation}`}>
				<div className={formStyles.confirmationCard}>
					<p className={formStyles.confirmationMark}>&#10003;</p>
					<h2>Feedback sent</h2>
					<p>Thanks for helping us improve. We&rsquo;ll follow up by email if we need more detail.</p>
					<div className={formStyles.confirmationActions}>
						<Link href='/search' className={formStyles.buttonOutline}>
							Back to search
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={formStyles.form} noValidate>
			<fieldset className={formStyles.section}>
				<div className={formStyles.sectionGrid}>
					<div className={formStyles.field}>
						<label htmlFor={nameId} className={formStyles.fieldLabel}>
							Name (optional)
						</label>
						<input
							id={nameId}
							type='text'
							name='name'
							maxLength={100}
							autoComplete='name'
							className={formStyles.input}
							aria-invalid={Boolean(fieldErrors.name)}
							aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
						/>
						{fieldErrors.name && (
							<span id={`${nameId}-error`} className={styles.fieldError} role='alert'>
								{fieldErrors.name}
							</span>
						)}
					</div>
					<div className={formStyles.field}>
						<label htmlFor={emailId} className={formStyles.fieldLabel}>
							Email{' '}
							<span className={styles.required} aria-hidden='true'>
								*
							</span>
						</label>
						<input
							id={emailId}
							type='email'
							name='email'
							required
							maxLength={254}
							autoComplete='email'
							className={formStyles.input}
							aria-invalid={Boolean(fieldErrors.email)}
							aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
						/>
						{fieldErrors.email && (
							<span id={`${emailId}-error`} className={styles.fieldError} role='alert'>
								{fieldErrors.email}
							</span>
						)}
					</div>
					<div className={`${formStyles.field} ${formStyles.fieldFull}`}>
						<label htmlFor={descriptionId} className={formStyles.fieldLabel}>
							Description{' '}
							<span className={styles.required} aria-hidden='true'>
								*
							</span>
						</label>
						<textarea
							id={descriptionId}
							name='description'
							required
							rows={6}
							maxLength={5000}
							className={formStyles.input}
							aria-invalid={Boolean(fieldErrors.description)}
							aria-describedby={
								fieldErrors.description ? `${descriptionId}-error` : undefined
							}
						/>
						{fieldErrors.description && (
							<span
								id={`${descriptionId}-error`}
								className={styles.fieldError}
								role='alert'
							>
								{fieldErrors.description}
							</span>
						)}
					</div>
					<div className={styles.honeypot} aria-hidden='true'>
						<label>
							Leave this field empty
							<input type='text' name='website' tabIndex={-1} autoComplete='off' />
						</label>
					</div>
					<div className={`${formStyles.field} ${formStyles.fieldFull}`}>
						<AntiBot onValidChange={setIsAntiBotValid} />
					</div>
				</div>
			</fieldset>

			{submitError && (
				<div className={formStyles.submitError} role='alert'>
					<p>{submitError}</p>
				</div>
			)}

			<div className={formStyles.submitRow}>
				<button
					type='submit'
					className={formStyles.buttonSolid}
					disabled={!isAntiBotValid || isSubmitting}
				>
					{isSubmitting ? 'Sending…' : 'Send feedback'}
				</button>
			</div>
		</form>
	);
}
