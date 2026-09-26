'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import modalStyles from '@/components/ContactModal/contactModal.module.scss';
import { formatSubmittedDate } from '@/lib/format';
import { type AdminUserRow, getUserDisplayName } from './adminUserRow';
import styles from './adminUsersTable.module.scss';
import { GroupList } from './UserGroups';

function CloseIcon() {
	return (
		<svg viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
			<path
				d='M5 5l14 14M19 5L5 19'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
			/>
		</svg>
	);
}

export function MobileUsersTable({ users }: { users: AdminUserRow[] }) {
	const [selected, setSelected] = useState<AdminUserRow | null>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const titleId = useId();

	useEffect(() => {
		if (!selected) return;

		closeRef.current?.focus();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setSelected(null);
		}
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [selected]);

	return (
		<>
			<table className={styles.mobileTable}>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td>{user.id}</td>
							<td>
								<button
									type='button'
									className={styles.nameButton}
									onClick={() => setSelected(user)}
								>
									{getUserDisplayName(user)}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{selected &&
				createPortal(
					<div className={modalStyles.overlay} onClick={() => setSelected(null)}>
						<div
							className={modalStyles.panel}
							role='dialog'
							aria-modal='true'
							aria-labelledby={titleId}
							onClick={(event) => event.stopPropagation()}
						>
							<button
								ref={closeRef}
								type='button'
								className={modalStyles.closeBtn}
								onClick={() => setSelected(null)}
								aria-label='Close'
							>
								<CloseIcon />
							</button>

							<p className={modalStyles.eyebrow}>User</p>
							<h2 id={titleId}>{getUserDisplayName(selected)}</h2>

							<dl className={styles.detailList}>
								<div className={styles.detailRow}>
									<dt>ID</dt>
									<dd>{selected.id}</dd>
								</div>
								<div className={styles.detailRow}>
									<dt>Email</dt>
									<dd>
										<a href={`mailto:${selected.email}`}>{selected.email}</a>
									</dd>
								</div>
								<div className={styles.detailRow}>
									<dt>Registered</dt>
									<dd>{formatSubmittedDate(selected.createdAt)}</dd>
								</div>
								<div className={styles.detailRow}>
									<dt>Group(s)</dt>
									<dd>
										<GroupList teams={selected.teams} />
									</dd>
								</div>
							</dl>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
