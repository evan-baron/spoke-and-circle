import type { ChangeEvent } from 'react';
import styles from './teamForm.module.scss';

interface CheckboxProps {
	label: string;
	name: string;
	value?: string;
	checked?: boolean;
	defaultChecked?: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({
	label,
	name,
	value,
	checked,
	defaultChecked,
	onChange,
}: CheckboxProps) {
	return (
		<label className={styles.checkbox}>
			<input
				type='checkbox'
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
				onChange={onChange}
			/>
			<span>{label}</span>
		</label>
	);
}
