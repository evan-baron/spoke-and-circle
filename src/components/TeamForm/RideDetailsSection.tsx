import type { TeamFormValues } from '@/lib/types';
import { Checkbox } from './Checkbox';
import { DROP_POLICIES, PACES } from './constants';
import { Field } from './Field';
import { RideScheduleEditor } from './RideScheduleEditor';
import { Section } from './Section';
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
		<Section title='Ride Details'>
			<RideScheduleEditor initialRide={values.rides[0]} />
			<Field
				label='Schedule notes'
				hint='Anything the schedule above cannot capture, like weather-permitting rides or holiday changes'
				full
			>
				<textarea
					name='scheduleNotes'
					defaultValue={values.scheduleNotes}
					maxLength={500}
					rows={3}
					className={styles.input}
				/>
			</Field>
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
			<Field label='Average Riding Pace'>
				<select name='pace' defaultValue={values.pace} className={styles.input}>
					{PACES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
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
			<Field
				label='Additional Ride Details'
				hint='Up to 1,000 characters. Leave a blank line between paragraphs'
				full
			>
				<textarea
					name='additionalRideDetails'
					defaultValue={values.additionalRideDetails}
					maxLength={1000}
					rows={6}
					className={styles.input}
				/>
			</Field>
		</Section>
	);
}
