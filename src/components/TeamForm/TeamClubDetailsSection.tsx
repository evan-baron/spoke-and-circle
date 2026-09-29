import type { TeamFormValues } from '@/lib/types';
import { Checkbox } from './Checkbox';
import { SCHEDULES } from './constants';
import { Field } from './Field';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface TeamClubDetailsSectionProps {
	values: TeamFormValues;
}

export function TeamClubDetailsSection({
	values,
}: TeamClubDetailsSectionProps) {
	return (
		<Section title='Group Structure'>
			<Field label='Competitive or casual'>
				<select
					name='competitiveOrCasual'
					defaultValue={values.competitiveOrCasual}
					className={styles.input}
				>
					<option value='Casual'>Casual</option>
					<option value='Competitive'>Competitive</option>
				</select>
			</Field>
			<Field label='Dues amount' hint='Leave blank if none'>
				<input
					type='text'
					name='duesAmount'
					defaultValue={values.duesAmount}
					placeholder='e.g. $150/year'
					className={styles.input}
				/>
			</Field>
			<Field label='Dues schedule'>
				<select
					name='duesSchedule'
					defaultValue={values.duesSchedule}
					className={styles.input}
				>
					{SCHEDULES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Required races' hint='Minimum per season'>
				<input
					type='number'
					name='requiredRaces'
					defaultValue={values.requiredRaces}
					min={0}
					className={styles.input}
				/>
			</Field>
			<Field label='Mileage requirement' hint='Minimum miles'>
				<input
					type='number'
					name='mileageMin'
					defaultValue={values.mileageMin}
					min={0}
					className={styles.input}
				/>
			</Field>
			<Field label='Mileage frequency'>
				<select
					name='mileageFrequency'
					defaultValue={values.mileageFrequency}
					className={styles.input}
				>
					{SCHEDULES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Sponsors' hint='Comma-separated' full>
				<input
					type='text'
					name='sponsors'
					defaultValue={values.sponsors}
					placeholder='e.g. Lone Star Bikes, Velocity Nutrition'
					className={styles.input}
				/>
			</Field>

			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Team attributes</span>
				<div className={styles.checkboxRow}>
					<Checkbox
						label='Instructional'
						name='instructional'
						defaultChecked={values.instructional}
					/>
					<Checkbox
						label='Dues required'
						name='duesRequired'
						defaultChecked={values.duesRequired}
					/>
					<Checkbox
						label='Required rides'
						name='requiredRides'
						defaultChecked={values.requiredRides}
					/>
					<Checkbox
						label='Required kit / uniform'
						name='requiredKit'
						defaultChecked={values.requiredKit}
					/>
				</div>
			</div>

			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Event types</span>
				<div className={styles.checkboxRow}>
					<Checkbox
						label='Sponsor events'
						name='eventSponsor'
						defaultChecked={values.eventSponsor}
					/>
					<Checkbox
						label='Team-specific events'
						name='eventTeamSpecific'
						defaultChecked={values.eventTeamSpecific}
					/>
					<Checkbox
						label='Public events'
						name='eventPublic'
						defaultChecked={values.eventPublic}
					/>
					<Checkbox
						label='Recruiting events'
						name='eventRecruiting'
						defaultChecked={values.eventRecruiting}
					/>
				</div>
			</div>

			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Join / applicant requirements</span>
				<div className={styles.checkboxRow}>
					<Checkbox
						label='Try-outs required'
						name='joinTryouts'
						defaultChecked={values.joinTryouts}
					/>
					<Checkbox
						label='Referral required'
						name='joinReferral'
						defaultChecked={values.joinReferral}
					/>
					<Checkbox
						label='Invite only'
						name='joinInviteOnly'
						defaultChecked={values.joinInviteOnly}
					/>
					<Checkbox
						label='Open to all'
						name='joinOpen'
						defaultChecked={values.joinOpen}
					/>
				</div>
			</div>
		</Section>
	);
}
