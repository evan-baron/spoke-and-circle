import { Checkbox } from './Checkbox';
import { SKILL_LEVELS } from './constants';
import styles from './teamForm.module.scss';

interface SkillLevelsFieldProps {
	defaultValues: string[];
}

export function SkillLevelsField({ defaultValues }: SkillLevelsFieldProps) {
	return (
		<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
			<span className={styles.fieldLabel}>Skill levels welcome</span>
			<div className={styles.checkboxRow}>
				{SKILL_LEVELS.map((option) => (
					<Checkbox
						key={option}
						label={option}
						name='skillLevel'
						value={option}
						defaultChecked={defaultValues.includes(option)}
					/>
				))}
			</div>
		</div>
	);
}
