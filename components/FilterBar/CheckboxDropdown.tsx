'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import styles from './filterBar.module.scss';

interface CheckboxDropdownProps {
	name: string;
	label: string;
	options: string[];
	defaultValues?: string[];
}

export function CheckboxDropdown({
	name,
	label,
	options,
	defaultValues = [],
}: CheckboxDropdownProps) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string[]>(defaultValues);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	// Submitting the form is a full native navigation, which remounts this
	// component and resets `open`. So checking a box must NOT submit —
	// only closing the dropdown (outside click, Escape, or the trigger)
	// does, letting the user check several boxes without it collapsing
	// after each one.
	function closeAndSubmit() {
		if (open) {
			triggerRef.current?.form?.requestSubmit();
		}
		setOpen(false);
	}

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
				{options.map((option) => (
					<label key={option} className={styles.checkboxDropdownOption}>
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
			</div>
		</div>
	);
}
