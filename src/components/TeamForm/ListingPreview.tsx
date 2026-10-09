'use client';

import { useEffect, useRef } from 'react';
import { TeamDetail } from '@/components/TeamDetail/TeamDetail';
import type { Team } from '@/lib/types';
import styles from './listingPreview.module.scss';

interface ListingPreviewProps {
	open: boolean;
	team: Team | null;
	isSubmitting: boolean;
	isAntiBotValid: boolean;
	onClose: () => void;
}

export function ListingPreview({
	open,
	team,
	isSubmitting,
	isAntiBotValid,
	onClose,
}: ListingPreviewProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-label='Listing preview'
			onClose={onClose}
		>
			<div className={styles.banner} role='status'>
				<strong>Preview</strong>
				<span>Not submitted yet. This is how your listing will look.</span>
			</div>

			<div className={styles.scroll}>
				<div className={styles.content}>
					{open && team && <TeamDetail team={team} preview />}
				</div>
			</div>

			<div className={styles.bar}>
				{!isAntiBotValid && (
					<p className={styles.hint}>
						Answer the human check on the last step to submit.
					</p>
				)}
				<div className={styles.actions}>
					<button
						type='button'
						className={styles.buttonOutline}
						disabled={isSubmitting}
						onClick={onClose}
					>
						Back to editing
					</button>
					<button
						type='submit'
						className={styles.buttonSolid}
						disabled={!isAntiBotValid || isSubmitting}
					>
						{isSubmitting ? 'Submitting…' : 'Submit for review'}
					</button>
				</div>
			</div>
		</dialog>
	);
}
