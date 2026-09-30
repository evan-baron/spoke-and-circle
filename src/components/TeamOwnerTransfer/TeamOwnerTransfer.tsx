'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { formatSubmitter } from '@/lib/format';
import type { UserOption } from '@/lib/types';
import { adminAPI } from '@/services/api';
import styles from './teamOwnerTransfer.module.scss';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

interface TeamOwnerTransferProps {
	teamId: string;
	teamName: string;
	owner: UserOption | null;
}

function userLabel(user: UserOption): string {
	return formatSubmitter(user);
}

const TeamOwnerTransfer = ({
	teamId,
	teamName,
	owner,
}: TeamOwnerTransferProps) => {
	const router = useRouter();
	const [currentOwner, setCurrentOwner] = useState(owner);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<UserOption[]>([]);
	const [status, setStatus] = useState<SearchStatus>('idle');
	const [pendingUser, setPendingUser] = useState<UserOption | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const inputId = useId();
	const dialogTitleId = useId();

	useEffect(() => {
		const term = query.trim();

		if (term.length < MIN_QUERY_LENGTH) {
			setResults([]);
			setStatus('idle');
			return;
		}

		setStatus('loading');
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const data = await adminAPI.searchUsers(term, controller.signal);
				setResults(data.users);
				setStatus('done');
			} catch {
				if (controller.signal.aborted) return;
				setResults([]);
				setStatus('error');
			}
		}, DEBOUNCE_MS);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (pendingUser && !dialog.open) dialog.showModal();
		if (!pendingUser && dialog.open) dialog.close();
	}, [pendingUser]);

	function selectUser(user: UserOption) {
		setError(null);
		setNotice(null);
		setPendingUser(user);
	}

	function cancelTransfer() {
		if (isSaving) return;
		setPendingUser(null);
	}

	async function confirmTransfer() {
		if (!pendingUser || isSaving) return;

		setIsSaving(true);
		setError(null);

		try {
			const { emailStatus } = await adminAPI.transferTeam(
				teamId,
				pendingUser.id,
			);
			setCurrentOwner(pendingUser);
			setQuery('');
			setNotice(
				emailStatus === 'sent' ?
					`Ownership transferred to ${userLabel(pendingUser)}. They were notified by email.`
				:	`Ownership transferred to ${userLabel(pendingUser)}, but the notification email was not sent (${emailStatus.replace('_', ' ')}).`,
			);
			router.refresh();
		} catch (transferError) {
			setError(describeSubmitError(transferError).join(' '));
		} finally {
			setIsSaving(false);
			setPendingUser(null);
		}
	}

	const message =
		status === 'loading' ? 'Searching…'
		: status === 'done' && results.length === 0 ? 'No users match that email'
		: status === 'error' ? 'Could not search users. Try again.'
		: null;

	return (
		<section className={styles.card} aria-label='Team owner'>
			<h2 className={styles.title}>Owner</h2>
			<p className={styles.current}>
				{currentOwner ?
					<>
						<strong>{userLabel(currentOwner)}</strong>
						{formatSubmitter(currentOwner) !== currentOwner.email && (
							<span className={styles.muted}> &middot; {currentOwner.email}</span>
						)}
					</>
				:	<span className={styles.muted}>No owner (submitted anonymously)</span>}
			</p>

			<label htmlFor={inputId} className={styles.label}>
				Transfer to another user
			</label>
			<input
				id={inputId}
				type='search'
				autoComplete='off'
				placeholder='Search users by email'
				className={styles.input}
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>

			{results.length > 0 && (
				<ul className={styles.results}>
					{results.map((user) => (
						<li key={user.id}>
							<button
								type='button'
								className={styles.result}
								onClick={() => selectUser(user)}
							>
								<span className={styles.resultName}>{userLabel(user)}</span>
								{userLabel(user) !== user.email && (
									<span className={styles.muted}>{user.email}</span>
								)}
							</button>
						</li>
					))}
				</ul>
			)}
			{message && <p className={styles.message}>{message}</p>}
			{notice && (
				<p className={styles.notice} role='status'>
					{notice}
				</p>
			)}
			{error && (
				<p className={styles.error} role='alert'>
					{error}
				</p>
			)}

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={dialogTitleId}
				onClose={cancelTransfer}
			>
				{pendingUser && (
					<>
						<h2 id={dialogTitleId} className={styles.dialogTitle}>
							Confirm changing ownership to {userLabel(pendingUser)}
							{userLabel(pendingUser) !== pendingUser.email &&
								` (${pendingUser.email})`}
							?
						</h2>
						<p className={styles.dialogText}>
							&ldquo;{teamName}&rdquo; will move to this user, and they will
							be notified by email.
						</p>
						<div className={styles.dialogActions}>
							<button
								type='button'
								className={styles.buttonOutline}
								disabled={isSaving}
								onClick={cancelTransfer}
							>
								Cancel
							</button>
							<button
								type='button'
								className={styles.buttonSolid}
								disabled={isSaving}
								onClick={confirmTransfer}
							>
								{isSaving ? 'Transferring…' : 'OK'}
							</button>
						</div>
					</>
				)}
			</dialog>
		</section>
	);
};

export default TeamOwnerTransfer;
