'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { useInvalidatePendingTeamCount } from '@/hooks/usePendingTeamCount';
import { teamAPI } from '@/services/api';
import styles from './deleteTeamButton.module.scss';

interface DeleteTeamButtonProps {
	teamId: string;
	teamName: string;
	redirectTo?: string;
}

const DeleteTeamButton = ({
	teamId,
	teamName,
	redirectTo,
}: DeleteTeamButtonProps) => {
	const router = useRouter();
	const invalidatePendingCount = useInvalidatePendingTeamCount();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	function cancel() {
		if (isDeleting) return;
		setOpen(false);
		setError(null);
	}

	async function confirmDelete() {
		if (isDeleting) return;

		setIsDeleting(true);
		setError(null);

		try {
			await teamAPI.remove(teamId);
			await invalidatePendingCount();
			setOpen(false);
			if (redirectTo) router.push(redirectTo);
			router.refresh();
		} catch (deleteError) {
			setError(describeSubmitError(deleteError).join(' '));
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<>
			<button
				type='button'
				className={styles.trigger}
				onClick={() => setOpen(true)}
			>
				Delete
			</button>

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={titleId}
				onClose={cancel}
			>
				<h2 id={titleId} className={styles.title}>
					Delete &ldquo;{teamName}&rdquo;?
				</h2>
				<p className={styles.text}>
					This permanently removes the group ride from Spoke &amp; Circle. It
					can&rsquo;t be undone.
				</p>
				{error && (
					<p className={styles.error} role='alert'>
						{error}
					</p>
				)}
				<div className={styles.actions}>
					<button
						type='button'
						className={styles.buttonOutline}
						disabled={isDeleting}
						onClick={cancel}
					>
						Cancel
					</button>
					<button
						type='button'
						className={styles.buttonDanger}
						disabled={isDeleting}
						onClick={confirmDelete}
					>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</button>
				</div>
			</dialog>
		</>
	);
};

export default DeleteTeamButton;
