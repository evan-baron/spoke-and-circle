import type { RideDay, TeamFormValues } from '@/lib/types';
import { Checkbox } from './Checkbox';
import { DAYS, DROP_POLICIES, SCHEDULES, SEASONS } from './constants';
import { Field } from './Field';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface RideDetailsSectionProps {
	values: TeamFormValues;
	rideSchedule: string;
	onRideScheduleChange: (value: string) => void;
	rideDays: RideDay[];
	onToggleRideDay: (day: string) => void;
	onRideDayDetailsChange: (day: string, details: string) => void;
	hasSegmentation: 'yes' | 'no' | null;
	onSegmentationChange: (value: 'yes' | 'no') => void;
	segmentationDescription: string;
	onSegmentationDescriptionChange: (value: string) => void;
}

export function RideDetailsSection({
	values,
	rideSchedule,
	onRideScheduleChange,
	rideDays,
	onToggleRideDay,
	onRideDayDetailsChange,
	hasSegmentation,
	onSegmentationChange,
	segmentationDescription,
	onSegmentationDescriptionChange,
}: RideDetailsSectionProps) {
	return (
		<Section title='Ride Details'>
			<Field label='Schedule'>
				<select
					name='rideSchedule'
					value={rideSchedule}
					onChange={(event) => onRideScheduleChange(event.target.value)}
					className={styles.input}
				>
					{SCHEDULES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			{rideSchedule !== 'Weekly' && (
				<Field label='Start times' hint='Comma-separated'>
					<input
						type='text'
						name='startTimes'
						defaultValue={values.startTimes}
						placeholder='e.g. Tue 6:00 PM, Sat 8:00 AM'
						className={styles.input}
					/>
				</Field>
			)}
			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Season(s)</span>
				<div className={styles.checkboxRow}>
					{SEASONS.map((season) => (
						<Checkbox
							key={season}
							label={season}
							name='season'
							value={season}
							defaultChecked={values.seasons.includes(season)}
						/>
					))}
				</div>
			</div>
			{rideSchedule === 'Weekly' && (
				<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
					<span className={styles.fieldLabel}>Days</span>
					<div className={styles.rideDayList}>
						{DAYS.map((day) => {
							const entry = rideDays.find((d) => d.day === day);
							return (
								<div key={day} className={styles.rideDayRow}>
									<Checkbox
										label={
											<>
												<span className={styles.dayFull}>{day}</span>
												<span className={styles.dayShort}>
													{day.slice(0, 3)}
												</span>
											</>
										}
										name='rideDay'
										value={day}
										checked={entry !== undefined}
										onChange={() => onToggleRideDay(day)}
									/>
									<label className={styles.rideDayDetails}>
										<span className={styles.fieldLabel}>Details</span>
										<input
											type='text'
											placeholder='e.g. 5:30pm meet outside The Broken Spoke'
											value={entry?.details ?? ''}
											disabled={!entry}
											onChange={(event) =>
												onRideDayDetailsChange(day, event.target.value)
											}
											className={styles.input}
										/>
									</label>
								</div>
							);
						})}
					</div>
					<input
						type='hidden'
						name='rideDays'
						value={JSON.stringify(rideDays)}
					/>
				</div>
			)}
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
