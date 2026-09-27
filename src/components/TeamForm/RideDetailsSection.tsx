import type { TeamFormValues } from '@/lib/types';
import { Checkbox } from './Checkbox';
import { DROP_POLICIES, PACES, SCHEDULES } from './constants';
import { Field } from './Field';
import { Section } from './Section';
import { SkillLevelsField } from './SkillLevelsField';
import styles from './teamForm.module.scss';

interface RideDetailsSectionProps {
	values: TeamFormValues;
	hasSegmentation: 'yes' | 'no' | null;
	onSegmentationChange: (value: 'yes' | 'no') => void;
	segmentationDescription: string;
	onSegmentationDescriptionChange: (value: string) => void;
}

export function RideDetailsSection({
	values,
	hasSegmentation,
	onSegmentationChange,
	segmentationDescription,
	onSegmentationDescriptionChange,
}: RideDetailsSectionProps) {
	return (
		<Section title='Ride details'>
			<Field label='Schedule'>
				<select
					name='rideSchedule'
					defaultValue={values.rideSchedule}
					className={styles.input}
				>
					{SCHEDULES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Start times' hint='Comma-separated'>
				<input
					type='text'
					name='startTimes'
					defaultValue={values.startTimes}
					placeholder='e.g. Tue 6:00 PM, Sat 8:00 AM'
					className={styles.input}
				/>
			</Field>
			<Field label='Pace'>
				<select name='pace' defaultValue={values.pace} className={styles.input}>
					{PACES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<SkillLevelsField defaultValues={values.skillLevels} />
			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Skill/Speed Segmentation</span>
				<div className={styles.checkboxRow}>
					<Checkbox
						label='Yes'
						name='hasSegmentation'
						value='yes'
						checked={hasSegmentation === 'yes'}
						onChange={() => onSegmentationChange('yes')}
					/>
					<Checkbox
						label='No'
						name='hasSegmentation'
						value='no'
						checked={hasSegmentation === 'no'}
						onChange={() => onSegmentationChange('no')}
					/>
				</div>
				{hasSegmentation === 'yes' && (
					<input
						type='text'
						name='segmentationDescription'
						placeholder='A Group, B Group, etc.'
						value={segmentationDescription}
						onChange={(event) =>
							onSegmentationDescriptionChange(event.target.value)
						}
						className={styles.input}
					/>
				)}
			</div>
			<Field label='Typical distance' hint='Miles'>
				<input
					type='number'
					name='typicalDistanceMiles'
					defaultValue={values.typicalDistanceMiles}
					min={0}
					className={styles.input}
				/>
			</Field>
			<Field label='Typical elevation gain' hint='Feet'>
				<input
					type='number'
					name='typicalElevationGainFt'
					defaultValue={values.typicalElevationGainFt}
					min={0}
					className={styles.input}
				/>
			</Field>
			<Field label='Drop or no-drop'>
				<select
					name='dropPolicy'
					defaultValue={values.dropPolicy}
					className={styles.input}
				>
					{DROP_POLICIES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Ride visibility'>
				<select
					name='rideVisibility'
					defaultValue={values.rideVisibility}
					className={styles.input}
				>
					<option value='Public'>Public</option>
					<option value='Private'>Private</option>
				</select>
			</Field>
		</Section>
	);
}
