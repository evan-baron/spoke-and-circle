'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Badge } from '@/components/Badge/Badge';
import tableStyles from '@/components/ResultsTable/resultsTable.module.scss';
import {
	formatMemberCount,
	formatSkillLevels,
	formatVerification,
} from '@/lib/format';
import { toneForPace, toneForVerified, toneForVisibility } from '@/lib/tone';
import type { Team } from '@/lib/types';
import styles from './adminTeamsTable.module.scss';

interface AdminTeamsTableProps {
	teams: Team[];
	totalCount: number;
	summarySuffix?: string;
}

export function AdminTeamsTable({
	teams,
	totalCount,
	summarySuffix = '',
}: AdminTeamsTableProps) {
	const [removedIds, setRemovedIds] = useState<string[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [pendingDelete, setPendingDelete] = useState<Team[] | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const selectAllRef = useRef<HTMLInputElement>(null);
	const dialogTitleId = useId();

	const visible = teams.filter((team) => !removedIds.includes(team.id));
	const selectedCount = visible.filter((team) =>
		selectedIds.includes(team.id),
	).length;
	const allSelected = visible.length > 0 && selectedCount === visible.length;

	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate =
				selectedCount > 0 && selectedCount < visible.length;
		}
	}, [selectedCount, visible.length]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (pendingDelete && !dialog.open) dialog.showModal();
		if (!pendingDelete && dialog.open) dialog.close();
	}, [pendingDelete]);

	function toggleOne(id: string) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
		);
	}

	function toggleAll(checked: boolean) {
		setSelectedIds(checked ? visible.map((team) => team.id) : []);
	}

	function requestDelete(ids: string[]) {
		setPendingDelete(visible.filter((team) => ids.includes(team.id)));
	}

	function confirmDelete() {
		if (!pendingDelete) return;
		const ids = pendingDelete.map((team) => team.id);
		setRemovedIds((prev) => [...prev, ...ids]);
		setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
		setPendingDelete(null);
	}

	function cancelDelete() {
		setPendingDelete(null);
	}

	const selectedTeamIds = visible
		.filter((team) => selectedIds.includes(team.id))
		.map((team) => team.id);

	const dialogTitle =
		pendingDelete?.length === 1 ?
			`Delete ${pendingDelete[0]?.name}?`
		:	`Delete ${pendingDelete?.length ?? 0} groups?`;

	return (
		<>
			<div className={styles.toolbar}>
				<p className={styles.count}>
					{totalCount - removedIds.length}{' '}
					{totalCount - removedIds.length === 1 ? 'result' : 'results'}
					{summarySuffix}
				</p>
				<div className={styles.toolbarActions}>
					<label className={styles.selectAll}>
						<input
							ref={selectAllRef}
							type='checkbox'
							className={styles.checkbox}
							checked={allSelected}
							disabled={visible.length === 0}
							onChange={(event) => toggleAll(event.target.checked)}
						/>
						<span>Select all</span>
					</label>
					<button
						type='button'
						className={styles.deleteButton}
						disabled={selectedCount === 0}
						onClick={() => requestDelete(selectedTeamIds)}
					>
						Delete selected ({selectedCount})
					</button>
				</div>
			</div>

			{visible.length === 0 ?
				<div className={tableStyles.empty}>
					<p>No groups to show.</p>
				</div>
			:	<>
					<ul className={tableStyles.cardList}>
						{visible.map((team) => (
							<li
								key={team.id}
								className={`${tableStyles.card} ${styles.adminCard}`}
								data-selected={selectedIds.includes(team.id)}
							>
								<div className={styles.cardRow}>
									<input
										type='checkbox'
										className={styles.checkbox}
										checked={selectedIds.includes(team.id)}
										aria-label={`Select ${team.name}`}
										onChange={() => toggleOne(team.id)}
									/>
									<Link
										href={`/teams/${team.id}`}
										className={`${tableStyles.cardLink} ${styles.cardLink}`}
									>
										<div className={tableStyles.cardHeader}>
											<span className={tableStyles.cardName}>{team.name}</span>
											<Badge tone='ink'>{team.type}</Badge>
										</div>
										<p className={tableStyles.cardLocation}>{team.location}</p>
										<div className={tableStyles.cardBadges}>
											<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
											<Badge tone={toneForVisibility(team.visibility)}>
												{team.visibility}
											</Badge>
											<span className={tableStyles.cardMeta}>
												{team.bikeType}
											</span>
											<span className={tableStyles.cardMeta}>
												{formatSkillLevels(team.skillLevels)}
											</span>
											<span className={tableStyles.cardMeta}>
												{formatMemberCount(team.memberCount)}
											</span>
										</div>
										<p
											className={tableStyles.cardVerification}
											data-verified={team.verified}
										>
											{formatVerification(team.verified, team.lastActiveYear)}
										</p>
									</Link>
								</div>
							</li>
						))}
					</ul>

					<table className={tableStyles.table}>
						<thead>
							<tr>
								<th className={styles.checkCell}>
									<span className={styles.srOnly}>Select</span>
								</th>
								<th>Name</th>
								<th>Type</th>
								<th>Location</th>
								<th>Bike type</th>
								<th>Skill level</th>
								<th>Pace</th>
								<th>Members</th>
								<th>Visibility</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{visible.map((team) => (
								<tr
									key={team.id}
									data-selected={selectedIds.includes(team.id)}
									className={styles.row}
								>
									<td className={styles.checkCell}>
										<input
											type='checkbox'
											className={styles.checkbox}
											checked={selectedIds.includes(team.id)}
											aria-label={`Select ${team.name}`}
											onChange={() => toggleOne(team.id)}
										/>
									</td>
									<td>
										<Link
											href={`/teams/${team.id}`}
											className={tableStyles.rowLink}
										>
											{team.name}
										</Link>
									</td>
									<td>
										<Badge tone='ink'>{team.type}</Badge>
									</td>
									<td>{team.location}</td>
									<td>{team.bikeType}</td>
									<td>{formatSkillLevels(team.skillLevels)}</td>
									<td>
										<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
									</td>
									<td>{formatMemberCount(team.memberCount)}</td>
									<td>
										<Badge tone={toneForVisibility(team.visibility)}>
											{team.visibility}
										</Badge>
									</td>
									<td>
										<Badge tone={toneForVerified(team.verified)}>
											{team.verified ?
												`Verified · ${team.lastActiveYear}`
											:	`Unverified`}
										</Badge>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			}

			<p className={styles.note}>
				This is a wireframe; deleting won&rsquo;t remove any data.
			</p>

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={dialogTitleId}
				onClose={cancelDelete}
			>
				{pendingDelete && (
					<>
						<h2 id={dialogTitleId} className={styles.dialogTitle}>
							{dialogTitle}
						</h2>
						{pendingDelete.length > 1 && (
							<ul className={styles.dialogNames}>
								{pendingDelete.slice(0, 5).map((team) => (
									<li key={team.id}>{team.name}</li>
								))}
								{pendingDelete.length > 5 && (
									<li>and {pendingDelete.length - 5} more</li>
								)}
							</ul>
						)}
						<p className={styles.dialogText}>
							This is a wireframe. Nothing is saved, and the list comes back
							when you reload the page.
						</p>
						<div className={styles.dialogActions}>
							<button
								type='button'
								className={styles.buttonOutline}
								onClick={cancelDelete}
							>
								Cancel
							</button>
							<button
								type='button'
								className={styles.buttonDanger}
								onClick={confirmDelete}
							>
								Delete
							</button>
						</div>
					</>
				)}
			</dialog>
		</>
	);
}
