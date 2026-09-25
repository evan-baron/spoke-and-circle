'use client';

import { useCombobox } from 'downshift';
import { useEffect, useRef, useState } from 'react';
import type { LocationOption } from '@/lib/types';
import { locationAPI } from '@/services/api';
import styles from './locationInput.module.scss';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const INVALID_MESSAGE = 'Choose a location from the list';

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

interface LocationInputProps {
	id: string;
	name?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	defaultValue?: string;
	includeZip?: boolean;
	inputClassName?: string;
	onSelect?: (item: LocationOption) => void;
}

function itemToString(item: LocationOption | null) {
	return item?.label ?? '';
}

export function LocationInput({
	id,
	name,
	placeholder,
	required,
	disabled,
	defaultValue,
	includeZip,
	inputClassName,
	onSelect,
}: LocationInputProps) {
	const [inputValue, setInputValue] = useState(defaultValue ?? '');
	const [selectedItem, setSelectedItem] = useState<LocationOption | null>(
		defaultValue ? { placeId: defaultValue, label: defaultValue } : null,
	);
	const [options, setOptions] = useState<LocationOption[]>([]);
	const [status, setStatus] = useState<SearchStatus>('idle');
	const inputRef = useRef<HTMLInputElement | null>(null);

	const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex } =
		useCombobox<LocationOption>({
			items: options,
			inputId: id,
			inputValue,
			selectedItem,
			itemToString,
			stateReducer: (state, { type, changes }) => {
				if (!onSelect) return changes;

				const { ItemClick, InputKeyDownEnter, InputBlur } =
					useCombobox.stateChangeTypes;

				if (type === ItemClick || type === InputKeyDownEnter) {
					return { ...changes, inputValue: '', isOpen: false };
				}
				if (type === InputBlur) {
					return {
						...changes,
						selectedItem: state.selectedItem,
						inputValue: state.inputValue,
					};
				}
				return changes;
			},
			onInputValueChange: ({ inputValue: next, type }) => {
				setInputValue(next ?? '');
				if (type === useCombobox.stateChangeTypes.InputChange) {
					setSelectedItem(null);
				}
			},
			onSelectedItemChange: ({ selectedItem: next }) => {
				if (!next) {
					setSelectedItem(null);
					return;
				}
				if (onSelect) {
					onSelect(next);
					return;
				}
				setSelectedItem(next);
				setInputValue(next.label);
			},
		});

	useEffect(() => {
		const term = inputValue.trim();

		if (selectedItem || term.length < MIN_QUERY_LENGTH) {
			setOptions([]);
			setStatus('idle');
			return;
		}

		setStatus('loading');
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const data = await locationAPI.search(term, controller.signal, {
					includeZip,
				});
				setOptions(data.locations);
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
	}, [inputValue, selectedItem, includeZip]);

	useEffect(() => {
		if (onSelect) return;
		const invalid = !selectedItem && (required || inputValue.trim() !== '');
		inputRef.current?.setCustomValidity(invalid ? INVALID_MESSAGE : '');
	}, [selectedItem, inputValue, required, onSelect]);

	const message =
		options.length > 0 ? null
		: status === 'loading' ? 'Searching…'
		: status === 'done' ? 'No matching US locations'
		: status === 'error' ? 'Could not load suggestions. Try again.'
		: null;

	const showPopover = isOpen && (options.length > 0 || message !== null);

	return (
		<div className={styles.root}>
			<input
				{...getInputProps({ ref: inputRef, disabled })}
				type='text'
				autoComplete='off'
				placeholder={placeholder}
				required={required}
				className={inputClassName ?? styles.input}
			/>
			{name && !onSelect && (
				<input type='hidden' name={name} value={selectedItem?.label ?? ''} />
			)}
			<div
				className={`${styles.popover} ${showPopover ? styles.popoverOpen : ''}`}
			>
				<ul {...getMenuProps()} className={styles.menu}>
					{isOpen &&
						options.map((item, index) => (
							<li
								key={item.placeId}
								{...getItemProps({ item, index })}
								className={`${styles.option} ${highlightedIndex === index ? styles.optionActive : ''}`}
							>
								{item.label}
							</li>
						))}
				</ul>
				{message && <p className={styles.message}>{message}</p>}
			</div>
		</div>
	);
}
