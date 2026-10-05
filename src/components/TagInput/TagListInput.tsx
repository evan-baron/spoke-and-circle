'use client';

import { useCombobox } from 'downshift';
import { useMemo, useState } from 'react';
import {
	isValidTag,
	MAX_TAGS,
	normalizeTag,
	TAG_OPTIONS,
} from '@/lib/tagOptions';
import { PillRemoveIcon } from '@/components/LocationInput/PillRemoveIcon';
import styles from '@/components/LocationInput/locationInput.module.scss';

const MAX_SUGGESTIONS = 8;

interface Suggestion {
	tag: string;
	isCustom: boolean;
}

interface TagListInputProps {
	id: string;
	name: string;
	placeholder?: string;
	defaultValues?: string[];
}

function rankSuggestions(query: string, selected: string[]): Suggestion[] {
	const term = normalizeTag(query);
	if (!term) return [];

	const available = TAG_OPTIONS.filter((tag) => !selected.includes(tag));
	const prefix = available.filter((tag) => tag.startsWith(term));
	const wordStart = available.filter(
		(tag) =>
			!tag.startsWith(term) &&
			tag.split(/[\s-]+/).some((word) => word.startsWith(term)),
	);
	const contains = available.filter(
		(tag) =>
			!prefix.includes(tag) && !wordStart.includes(tag) && tag.includes(term),
	);

	const listed = [...prefix, ...wordStart, ...contains]
		.slice(0, MAX_SUGGESTIONS)
		.map((tag) => ({ tag, isCustom: false }));

	const isNew = !TAG_OPTIONS.includes(term) && !selected.includes(term);
	if (isNew && isValidTag(term)) {
		return [...listed, { tag: term, isCustom: true }];
	}
	return listed;
}

export function TagListInput({
	id,
	name,
	placeholder,
	defaultValues = [],
}: TagListInputProps) {
	const [tags, setTags] = useState<string[]>(() =>
		[...new Set(defaultValues.map((tag) => tag.trim().toLowerCase()))]
			.filter(Boolean)
			.slice(0, MAX_TAGS),
	);
	const [inputValue, setInputValue] = useState('');
	const typedTag = normalizeTag(inputValue);
	const remaining = MAX_TAGS - tags.length;
	const atLimit = remaining <= 0;

	const suggestions = useMemo(
		() => rankSuggestions(inputValue, tags),
		[inputValue, tags],
	);

	function addTag(tag: string) {
		setTags((prev) => {
			if (prev.length >= MAX_TAGS || prev.includes(tag)) return prev;
			return [...prev, tag];
		});
	}

	function removeTag(tag: string) {
		setTags((prev) => prev.filter((item) => item !== tag));
	}

	const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex } =
		useCombobox<Suggestion>({
			inputId: id,
			items: suggestions,
			defaultHighlightedIndex: 0,
			itemToString: (item) => item?.tag ?? '',
			inputValue,
			selectedItem: null,
			stateReducer: (state, { type, changes }) => {
				switch (type) {
					case useCombobox.stateChangeTypes.InputKeyDownEnter:
					case useCombobox.stateChangeTypes.ItemClick:
						return { ...changes, inputValue: '' };
					case useCombobox.stateChangeTypes.InputBlur:
						return {
							...changes,
							selectedItem: state.selectedItem,
							inputValue: '',
						};
					default:
						return changes;
				}
			},
			onInputValueChange: ({ inputValue: next }) => setInputValue(next ?? ''),
			onSelectedItemChange: ({ selectedItem }) => {
				if (!selectedItem) return;
				addTag(selectedItem.tag);
				setInputValue('');
			},
		});

	const showInvalid =
		isOpen &&
		typedTag.length > 0 &&
		suggestions.length === 0 &&
		!tags.includes(typedTag) &&
		!isValidTag(typedTag);
	const showPopover = isOpen && !atLimit && (suggestions.length > 0 || showInvalid);

	return (
		<div className={styles.list}>
			<div className={styles.root}>
				<input
					{...getInputProps({
						onKeyDown: (event) => {
							if (event.key === 'Enter') event.preventDefault();
						},
					})}
					type='text'
					autoComplete='off'
					disabled={atLimit}
					placeholder={
						atLimit ? `Limit of ${MAX_TAGS} reached` : (
							placeholder
						)
					}
					className={styles.input}
				/>
				<div
					className={`${styles.popover} ${showPopover ? styles.popoverOpen : ''}`}
				>
					<ul {...getMenuProps()} className={styles.menu}>
						{isOpen &&
							!atLimit &&
							suggestions.map((item, index) => (
								<li
									key={`${item.isCustom ? 'custom' : 'listed'}-${item.tag}`}
									{...getItemProps({ item, index })}
									className={`${styles.option} ${highlightedIndex === index ? styles.optionActive : ''}`}
								>
									{item.isCustom ? `Add "${item.tag}"` : item.tag}
								</li>
							))}
					</ul>
					{showInvalid && (
						<p className={styles.message}>
							Tags can be one or two words, using letters, numbers, or hyphens
						</p>
					)}
				</div>
			</div>
			<span className={styles.hint}>
				{atLimit ?
					`You've added the maximum of ${MAX_TAGS} tags`
				: remaining === MAX_TAGS ?
					`Up to ${MAX_TAGS} tags`
				:	`${remaining} more ${remaining === 1 ? 'tag' : 'tags'} allowed`}
			</span>
			{tags.length > 0 && (
				<ul className={styles.pills} aria-label='Added tags'>
					{tags.map((tag) => (
						<li key={tag} className={styles.pill}>
							<span>{tag}</span>
							<button
								type='button'
								className={styles.pillRemove}
								aria-label={`Remove ${tag}`}
								onClick={() => removeTag(tag)}
							>
								<PillRemoveIcon />
							</button>
							<input type='hidden' name={name} value={tag} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
