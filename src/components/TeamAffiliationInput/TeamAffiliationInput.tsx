'use client';

import { useCombobox } from 'downshift';
import { useEffect, useMemo, useState } from 'react';
import type { TeamOption } from '@/lib/types';
import { teamAPI } from '@/services/api';
import styles from './teamAffiliationInput.module.scss';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

interface TeamAffiliationInputProps {
	name: string;
	affiliatedIdName: string;
	value: string;
	affiliatedId: string;
	onChange: (label: string, affiliatedId: string) => void;
	excludeId?: string;
	placeholder?: string;
}

function itemToString(item: TeamOption | null) {
	return item?.label ?? '';
}

export function TeamAffiliationInput({
	name,
	affiliatedIdName,
	value,
	affiliatedId,
	onChange,
	excludeId,
	placeholder,
}: TeamAffiliationInputProps) {
	const [options, setOptions] = useState<TeamOption[]>([]);
	const [status, setStatus] = useState<SearchStatus>('idle');

	const selectedItem = useMemo<TeamOption | null>(
		() => (affiliatedId ? { id: affiliatedId, label: value, location: '' } : null),
		[affiliatedId, value],
	);

	const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex } =
		useCombobox<TeamOption>({
			items: options,
			inputValue: value,
			selectedItem,
			itemToString,
			onInputValueChange: ({ inputValue: next, type }) => {
				if (type === useCombobox.stateChangeTypes.InputChange) {
					onChange(next ?? '', '');
				}
			},
			onSelectedItemChange: ({ selectedItem: next }) => {
				if (next) onChange(next.label, next.id);
			},
		});

	useEffect(() => {
		const term = value.trim();

		if (affiliatedId || term.length < MIN_QUERY_LENGTH) {
			setOptions([]);
			setStatus('idle');
			return;
		}

		setStatus('loading');
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const data = await teamAPI.search(term, controller.signal, {
					excludeId,
				});
				setOptions(data.teams);
				setStatus('done');
			} catch {
				if (controller.signal.aborted) return;
				setOptions([]);
				setStatus('error');
			}
		}, DEBOUNCE_MS);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [value, affiliatedId, excludeId]);

	const message =
		options.length > 0 ? null
		: status === 'loading' ? 'Searching…'
		: status === 'done' ? 'No matching teams — you can still enter free text'
		: status === 'error' ? 'Could not load suggestions. Try again.'
		: null;

	const showPopover = isOpen && (options.length > 0 || message !== null);

	return (
		<div className={styles.root}>
			<input
				{...getInputProps()}
				type='text'
				name={name}
				autoComplete='off'
				placeholder={placeholder}
				className={styles.input}
			/>
			<input type='hidden' name={affiliatedIdName} value={affiliatedId} />
			<div
				className={`${styles.popover} ${showPopover ? styles.popoverOpen : ''}`}
			>
				<ul {...getMenuProps()} className={styles.menu}>
					{isOpen &&
						options.map((item, index) => (
							<li
								key={item.id}
								{...getItemProps({ item, index })}
								className={`${styles.option} ${highlightedIndex === index ? styles.optionActive : ''}`}
							>
								<span>{item.label}</span>
								<span className={styles.optionLocation}>{item.location}</span>
							</li>
						))}
				</ul>
				{message && <p className={styles.message}>{message}</p>}
			</div>
		</div>
	);
}
