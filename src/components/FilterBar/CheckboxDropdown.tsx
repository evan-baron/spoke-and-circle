'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import styles from './filterBar.module.scss';

interface CheckboxDropdownProps {
	name: string;
	label: string;
	options: string[];
	defaultValues?: string[];
	autoSubmitOnClose?: boolean;
	searchable?: boolean;
}

export function CheckboxDropdown({
	name,
	label,
	options,
	defaultValues = [],
	autoSubmitOnClose = true,
	searchable = false,
}: CheckboxDropdownProps) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string[]>(defaultValues);
	const [query, setQuery] = useState('');
	const searchRef = useRef<HTMLInputElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	// Submitting the form is a full native navigation, which remounts this
	// component and resets `open`. So checking a box must NOT submit —
	// only closing the dropdown (outside click, Escape, or the trigger)
	// does, letting the user check several boxes without it collapsing
	// after each one.
	function closeAndSubmit() {
		if (open && autoSubmitOnClose) {
			triggerRef.current?.form?.requestSubmit();
		}
		setOpen(false);
		setQuery('');
	}

	useEffect(() => {
		if (open && searchable) searchRef.current?.focus();
	}, [open, searchable]);

	useEffect(() => {
		if (!open) return;

		function handlePointerDown(event: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				closeAndSubmit();
			}
		}
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') closeAndSubmit();
		}

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	function toggleOption(option: string, event: ChangeEvent<HTMLInputElement>) {
		setSelected((prev) =>
			event.target.checked ?
				[...prev, option]
			:	prev.filter((value) => value !== option),
		);
	}

	const normalizedQuery = query.trim().toLowerCase();
	const matches = (option: string) =>
		option.toLowerCase().includes(normalizedQuery);
	const hasMatches = options.some(matches);

	const summary =
		selected.length === 0 ? label
		: selected.length === 1 ? selected[0]
		: `${selected.length} selected`;

	return (
		<div className={styles.checkboxDropdown} ref={rootRef}>
			<button
				ref={triggerRef}
				type='button'
				className={styles.checkboxDropdownTrigger}
				aria-haspopup='listbox'
				aria-expanded={open}
				onClick={() => (open ? closeAndSubmit() : setOpen(true))}
			>
				<span>{summary}</span>
				<span className={styles.checkboxDropdownCaret} aria-hidden='true'>
					&#9662;
				</span>
			</button>
			<div
				className={`${styles.checkboxDropdownPanel} ${open ? '' : styles.checkboxDropdownPanelClosed}`}
				role='group'
				aria-label={label}
			>
				{searchable && (
					<input
						ref={searchRef}
						type='search'
						value={query}
						placeholder='Search&hellip;'
						aria-label={`Search ${label}`}
						autoComplete='off'
						className={styles.checkboxDropdownSearch}
						onChange={(event) => setQuery(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') event.preventDefault();
						}}
					/>
				)}
				{options.map((option) => (
					<label
						key={option}
						className={styles.checkboxDropdownOption}
						hidden={!matches(option)}
					>
						<input
							type='checkbox'
							name={name}
							value={option}
							checked={selected.includes(option)}
							onChange={(event) => toggleOption(option, event)}
						/>
						<span>{option}</span>
					</label>
				))}
				{searchable && !hasMatches && (
					<p className={styles.checkboxDropdownEmpty}>No matches</p>
				)}
			</div>
		</div>
	);
}
