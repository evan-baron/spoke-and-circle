'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { PossibleDuplicates } from '@/components/admin/PossibleDuplicates/PossibleDuplicates';
import type { PossibleDuplicate } from '@/services/duplicateService';
import styles from './pendingGroupLink.module.scss';

interface PendingGroupLinkProps {
	teamId: string;
	name: string;
	typeLabel: string;
	location: string;
	submittedBy: string;
	submittedOn: string;
	matches: PossibleDuplicate[];
	linkClassName?: string;
}

export function PendingGroupLink({
	teamId,
	name,
	typeLabel,
	location,
	submittedBy,
	submittedOn,
	matches,
	linkClassName,
}: PendingGroupLinkProps) {
	const [open, setOpen] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const reviewHref = `/admin/pending/${teamId}`;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	if (matches.length === 0) {
		return (
			<Link href={reviewHref} className={linkClassName}>
				{name}
			</Link>
		);
	}

	return (
		<>
			<Link
				href={reviewHref}
				className={`${styles.desktopOnly} ${linkClassName ?? ''}`}
			>
				{name}
			</Link>
			<button
				type='button'
				className={`${styles.trigger} ${styles.mobileOnly} ${linkClassName ?? ''}`}
				onClick={() => setOpen(true)}
			>
				{name}
			</button>
			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={titleId}
				onClose={() => setOpen(false)}
				onClick={(event) => {
					if (event.target === event.currentTarget) setOpen(false);
				}}
			>
				<h2 id={titleId} className={styles.title}>
					Possible duplicates
				</h2>

				<div className={styles.scroll}>
					<section className={styles.submitted}>
						<p className={styles.eyebrow}>Submitted group</p>
						<p className={styles.submittedName}>{name}</p>
						<p className={styles.meta}>
							{typeLabel} &middot; {location}
						</p>
						<p className={styles.meta}>
							Submitted {submittedOn} by {submittedBy}
						</p>
					</section>

					<hr className={styles.divider} />

					<section>
						<p className={styles.eyebrow}>
							{matches.length === 1 ? 'Possible match' : 'Possible matches'}
						</p>
						<PossibleDuplicates matches={matches} />
					</section>
				</div>

				<div className={styles.actions}>
					<button
						type='button'
						className={styles.buttonOutline}
						onClick={() => setOpen(false)}
					>
						Close
					</button>
					<Link href={reviewHref} className={styles.buttonSolid}>
						Review submission
					</Link>
				</div>
			</dialog>
		</>
	);
}
