'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { RequiredMark } from './RequiredMark';
import styles from './teamForm.module.scss';

interface FieldProps {
	label: string;
	hint?: string;
	full?: boolean;
	required?: boolean;
	maxLength?: number;
	children: ReactNode;
}

export function Field({
	label,
	hint,
	full,
	required,
	maxLength,
	children,
}: FieldProps) {
	const ref = useRef<HTMLLabelElement>(null);
	const [length, setLength] = useState(0);

	const readLength = () => {
		const control = ref.current?.querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('input, textarea');
		setLength(control?.value.length ?? 0);
	};

	useEffect(() => {
		if (maxLength !== undefined) readLength();
	});

	return (
		<label
			ref={ref}
			className={`${styles.field} ${full ? styles.fieldFull : ''}`}
			onInput={maxLength === undefined ? undefined : readLength}
		>
			<span className={styles.fieldLabel}>
				{label}
				{required && <RequiredMark />}
			</span>
			{children}
			{maxLength !== undefined ?
				<span className={styles.fieldFooter}>
					{hint && <span className={styles.fieldHint}>{hint}</span>}
					<span className={styles.fieldCount} aria-live='off'>
						{(maxLength - length).toLocaleString('en-US')} characters remaining
					</span>
				</span>
			: hint ?
				<span className={styles.fieldHint}>{hint}</span>
			:	null}
		</label>
	);
}
