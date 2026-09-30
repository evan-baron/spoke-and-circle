'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { useCurrentUser } from '@/contexts/CurrentUserContext';
import { isMissingName } from '@/lib/format';
import { profileAPI } from '@/services/api';
import styles from './completeProfileModal.module.scss';

const DISMISSED_KEY = 'complete-profile-dismissed';
const DASHBOARD_PATH = '/dashboard';

function readDismissed(): boolean {
	try {
		return sessionStorage.getItem(DISMISSED_KEY) === 'true';
	} catch {
		return false;
	}
}

function writeDismissed() {
	try {
		sessionStorage.setItem(DISMISSED_KEY, 'true');
	} catch {
		return;
	}
}

export function CompleteProfileModal() {
	const user = useCurrentUser();
	const pathname = usePathname();
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const dismissedRef = useRef(false);
	const titleId = useId();
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const needsName = !!user && isMissingName(user.firstName);

	useEffect(() => {
		if (!needsName) {
			setOpen(false);
			return;
		}

		const dismissed = dismissedRef.current || readDismissed();
		if (pathname === DASHBOARD_PATH || !dismissed) setOpen(true);
	}, [needsName, pathname]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open, needsName]);

	function notNow() {
		dismissedRef.current = true;
		writeDismissed();
		setOpen(false);
		setErrors([]);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSaving) return;

		const form = new FormData(event.currentTarget);
		setIsSaving(true);
		setErrors([]);

		try {
			await profileAPI.updateName({
				firstName: String(form.get('firstName') ?? ''),
				lastName: String(form.get('lastName') ?? ''),
			});
			setOpen(false);
			router.refresh();
		} catch (error) {
			setErrors(describeSubmitError(error));
		} finally {
			setIsSaving(false);
		}
	}

	if (!needsName) return null;

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby={titleId}
			onClose={notNow}
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<h2 id={titleId} className={styles.title}>
					Complete your profile
				</h2>
				<p className={styles.text}>
					Add your name so admins and emails can address you properly.
				</p>

				<label className={styles.field}>
					<span>First name</span>
					<input
						name='firstName'
						type='text'
						autoComplete='given-name'
						maxLength={50}
						required
						className={styles.input}
					/>
				</label>
				<label className={styles.field}>
					<span>Last name (optional)</span>
					<input
						name='lastName'
						type='text'
						autoComplete='family-name'
						maxLength={50}
						className={styles.input}
					/>
				</label>

				{errors.length > 0 && (
					<ul className={styles.errors} role='alert'>
						{errors.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				)}

				<div className={styles.actions}>
					<button
						type='button'
						className={styles.buttonOutline}
						disabled={isSaving}
						onClick={notNow}
					>
						Not now
					</button>
					<button
						type='submit'
						className={styles.buttonSolid}
						disabled={isSaving}
					>
						{isSaving ? 'Saving…' : 'OK'}
					</button>
				</div>
			</form>
		</dialog>
	);
}
