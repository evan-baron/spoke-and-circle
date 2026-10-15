'use client';

import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import styles from './leaveFormDialog.module.scss';

interface SignInRequiredDialogProps {
	open: boolean;
	onCancel: () => void;
}

export function SignInRequiredDialog({
	open,
	onCancel,
}: SignInRequiredDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby={titleId}
			onClose={onCancel}
		>
			<h2 id={titleId} className={styles.title}>
				Sign in to submit a group ride
			</h2>
			<p className={styles.text}>
				Group rides need an account so there is someone who can keep the
				listing up to date. You can keep filling out the form, but you will
				need to sign in before you can submit it.
			</p>
			<div className={styles.actions}>
				<button type='button' className={styles.buttonOutline} onClick={onCancel}>
					Cancel
				</button>
				<Link href='/auth/login?returnTo=/teams/new' className={styles.buttonSolid}>
					Sign in
				</Link>
			</div>
		</dialog>
	);
}
