'use client';

import { useEffect, useId, useRef } from 'react';
import styles from './leaveFormDialog.module.scss';

interface LeaveFormDialogProps {
	open: boolean;
	onStay: () => void;
	onLeave: () => void;
}

export function LeaveFormDialog({ open, onStay, onLeave }: LeaveFormDialogProps) {
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
			onClose={onStay}
		>
			<h2 id={titleId} className={styles.title}>
				Leave without submitting?
			</h2>
			<p className={styles.text}>
				Your answers and photos won&rsquo;t be saved if you leave now.
			</p>
			<div className={styles.actions}>
				<button type='button' className={styles.buttonOutline} onClick={onLeave}>
					Leave
				</button>
				<button type='button' className={styles.buttonSolid} onClick={onStay}>
					Keep editing
				</button>
			</div>
		</dialog>
	);
}
