'use client';

import { useEffect, useId, useRef } from 'react';
import styles from '@/components/forms/TeamForm/leaveFormDialog.module.scss';

const SEEN_KEY = 'defaultLocationNoticeSeen';

interface DefaultLocationNoticeProps {
	location: string;
	radius: number;
}

export function DefaultLocationNotice({
	location,
	radius,
}: DefaultLocationNoticeProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		try {
			if (sessionStorage.getItem(SEEN_KEY)) return;
		} catch {
			return;
		}
		dialogRef.current?.showModal();
	}, []);

	function markSeen() {
		try {
			sessionStorage.setItem(SEEN_KEY, 'true');
		} catch {
			return;
		}
	}

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby={titleId}
			onClose={markSeen}
		>
			<h2 id={titleId} className={styles.title}>
				Showing rides near {location}
			</h2>
			<p className={styles.text}>
				We&rsquo;re showing group rides within {radius} miles of {location}.
				Enter your city or ZIP code to search your area.
			</p>
			<div className={styles.actions}>
				<button
					type='button'
					className={styles.buttonSolid}
					onClick={() => dialogRef.current?.close()}
				>
					OK
				</button>
			</div>
		</dialog>
	);
}
