'use client';

import { useState } from 'react';
import { ALL_SKILL_LEVELS_LABEL } from '@/lib/format';
import { Checkbox } from './Checkbox';
import { SKILL_LEVELS } from './constants';
import { RequiredMark } from './RequiredMark';
import styles from './teamForm.module.scss';

interface SkillLevelsFieldProps {
	defaultValues: string[];
}

export function SkillLevelsField({ defaultValues }: SkillLevelsFieldProps) {
	const [selected, setSelected] = useState<string[]>(defaultValues);
	const allSelected = SKILL_LEVELS.every((level) => selected.includes(level));

	function toggleAll() {
		setSelected(allSelected ? [] : [...SKILL_LEVELS]);
	}

	function toggleLevel(level: string) {
		setSelected((prev) =>
			prev.includes(level) ?
				prev.filter((item) => item !== level)
			:	[...prev, level],
		);
	}

	return (
		<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
			<span className={styles.fieldLabel}>
				Skill levels welcome
				<RequiredMark />
			</span>
			<div className={styles.checkboxRow}>
				{SKILL_LEVELS.map((option) => (
					<Checkbox
						key={option}
						label={option}
						name='skillLevel'
						value={option}
						checked={selected.includes(option)}
						onChange={() => toggleLevel(option)}
					/>
				))}
				<Checkbox
					label={ALL_SKILL_LEVELS_LABEL}
					name='allSkillLevels'
					checked={allSelected}
					onChange={toggleAll}
				/>
			</div>
		</div>
	);
}
