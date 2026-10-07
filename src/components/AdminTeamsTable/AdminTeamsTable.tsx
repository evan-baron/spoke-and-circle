'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Badge } from '@/components/Badge/Badge';
import { Pagination } from '@/components/Pagination/Pagination';
import tableStyles from '@/components/ResultsTable/resultsTable.module.scss';
import { describeSubmitError } from '@/components/TeamForm/describeSubmitError';
import { useAdminTeams, useInvalidateAdminTeams } from '@/hooks/useAdminTeams';
import { formatSkillLevelLines } from '@/lib/format';
import type { RawSearchParams } from '@/lib/searchParams';
import {
	toneForCompetitiveOrCasual,
	toneForPace,
	toneForVerified,
} from '@/lib/tone';
import type { Team, TeamListPage } from '@/lib/types';
import { adminAPI } from '@/services/api';
import styles from './adminTeamsTable.module.scss';

function verifiedLabel(verified: boolean, lastActiveYear: number): string {
	if (!verified) return 'Unverified';
	return lastActiveYear ? `Verified · ${lastActiveYear}` : 'Verified';
}

interface AdminTeamsTableProps {
	queryString: string;
	initialPage: TeamListPage;
	initialPageLoadedAt: number;
	searchParams: RawSearchParams;
	summarySuffix?: string;
}

export function AdminTeamsTable({
	queryString,
	initialPage,
	initialPageLoadedAt,
	searchParams,
	summarySuffix = '',
}: AdminTeamsTableProps) {
	const { data } = useAdminTeams(queryString, initialPage, initialPageLoadedAt);
	const invalidateAdminTeams = useInvalidateAdminTeams();
	const teams = data.teams;
	const totalCount = data.total;
	const [removedIds, setRemovedIds] = useState<string[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [pendingDelete, setPendingDelete] = useState<Team[] | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [verifiedOverrides, setVerifiedOverrides] = useState<
		Record<string, boolean>
	>({});
	const [verifiedPendingIds, setVerifiedPendingIds] = useState<string[]>([]);
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
		setRemovedIds([]);
	}, [teams]);

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

	async function confirmDelete() {
		if (!pendingDelete || isDeleting) return;
		const ids = pendingDelete.map((team) => team.id);

		setIsDeleting(true);
		setDeleteError(null);

		try {
			await adminAPI.deleteTeams(ids);
			setRemovedIds((prev) => [...prev, ...ids]);
			setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
			setPendingDelete(null);
			void invalidateAdminTeams();
		} catch (error) {
			setDeleteError(describeSubmitError(error).join(' '));
		} finally {
			setIsDeleting(false);
		}
	}

	function cancelDelete() {
		if (isDeleting) return;
		setPendingDelete(null);
		setDeleteError(null);
	}

	function isVerified(team: Team): boolean {
		return verifiedOverrides[team.id] ?? team.verified;
	}

	async function toggleVerified(team: Team) {
		if (verifiedPendingIds.includes(team.id)) return;

		const previous = isVerified(team);
		setVerifiedPendingIds((prev) => [...prev, team.id]);
		setVerifiedOverrides((prev) => ({ ...prev, [team.id]: !previous }));

		try {
			const response = await fetch(`/api/admin/teams/${team.id}`, {
				method: 'PATCH',
			});
			if (!response.ok) throw new Error('Failed to toggle verification');
			const data: { verified: boolean } = await response.json();
			setVerifiedOverrides((prev) => ({ ...prev, [team.id]: data.verified }));
		} catch (error) {
			console.error('Error toggling verification:', error);
			setVerifiedOverrides((prev) => ({ ...prev, [team.id]: previous }));
		} finally {
			setVerifiedPendingIds((prev) => prev.filter((id) => id !== team.id));
		}
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
											{team.type === 'Group Ride' ?
												<Badge tone={toneForPace(team.pace)}>
													{team.pace} pace
												</Badge>
											:	<Badge
													tone={toneForCompetitiveOrCasual(
														team.competitiveOrCasual,
													)}
												>
													{team.competitiveOrCasual}
												</Badge>
											}
											{team.bikeTypes.map((bikeType) => (
												<Badge key={bikeType} tone='gold'>
													{bikeType}
												</Badge>
											))}
											{formatSkillLevelLines(team.skillLevels).map((level) => (
												<Badge key={level} tone='ink'>
													{level}
												</Badge>
											))}
										</div>
									</Link>
								</div>
								<div className={styles.cardActions}>
									<button
										type='button'
										className={styles.verifiedToggle}
										disabled={verifiedPendingIds.includes(team.id)}
										onClick={() => toggleVerified(team)}
										aria-label={
											isVerified(team) ?
												`Mark ${team.name} as unverified`
											:	`Mark ${team.name} as verified`
										}
									>
										<span
											className={tableStyles.cardVerification}
											data-verified={isVerified(team)}
										>
											{verifiedLabel(isVerified(team), team.lastActiveYear)}
										</span>
									</button>
									<Link
										href={`/admin/teams/${team.id}/edit`}
										className={styles.editLink}
									>
										Edit
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
								<th>Group type</th>
								<th>Competitive or recreational</th>
								<th>Location</th>
								<th>Cycling Disciplines</th>
								<th>Skill level</th>
								<th>Ride pace</th>
								<th>Status</th>
								<th>
									<span className={styles.srOnly}>Actions</span>
								</th>
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
									<td>
										<Badge
											tone={toneForCompetitiveOrCasual(
												team.competitiveOrCasual,
											)}
										>
											{team.competitiveOrCasual}
										</Badge>
									</td>
									<td>{team.location}</td>
									<td>{team.bikeTypes.join(', ')}</td>
									<td>
										{formatSkillLevelLines(team.skillLevels).map(
											(level, index, all) => (
												<span key={level} className={tableStyles.stackedLine}>
													{level}
													{index < all.length - 1 && ','}
												</span>
											),
										)}
									</td>
									<td>
										<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
									</td>
									<td>
										<button
											type='button'
											className={styles.verifiedToggle}
											disabled={verifiedPendingIds.includes(team.id)}
											onClick={() => toggleVerified(team)}
											aria-label={
												isVerified(team) ?
													`Mark ${team.name} as unverified`
												:	`Mark ${team.name} as verified`
											}
										>
											<Badge tone={toneForVerified(isVerified(team))}>
												{verifiedLabel(isVerified(team), team.lastActiveYear)}
											</Badge>
										</button>
									</td>
									<td>
										<Link
											href={`/admin/teams/${team.id}/edit`}
											className={styles.editLink}
										>
											Edit
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			}

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby={dialogTitleId}
				onClose={cancelDelete}
				onCancel={(event) => {
					if (isDeleting) event.preventDefault();
				}}
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
						{deleteError && (
							<p role='alert' className={styles.dialogError}>
								{deleteError}
							</p>
						)}
						<div className={styles.dialogActions}>
							<button
								type='button'
								className={styles.buttonOutline}
								disabled={isDeleting}
								onClick={cancelDelete}
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
					</>
				)}
			</dialog>

			<Pagination
				basePath='/admin/all'
				searchParams={searchParams}
				page={data.page}
				pageCount={data.pageCount}
			/>
		</>
	);
}
