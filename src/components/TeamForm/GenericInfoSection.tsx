import { useId } from 'react';
import { LocationInput } from '@/components/LocationInput/LocationInput';
import { LocationListInput } from '@/components/LocationInput/LocationListInput';
import { TeamAffiliationInput } from '@/components/TeamAffiliationInput/TeamAffiliationInput';
import type { TeamFormValues } from '@/lib/types';
import { CLUB_TYPES } from './constants';
import { Field } from './Field';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface GenericInfoSectionProps {
	values: TeamFormValues;
	groupType: string;
	onGroupTypeChange: (type: string) => void;
	affiliationLabel: string;
	affiliatedId: string;
	onAffiliationChange: (label: string, affiliatedId: string) => void;
	excludeTeamId?: string;
}

export function GenericInfoSection({
	values,
	groupType,
	onGroupTypeChange,
	affiliationLabel,
	affiliatedId,
	onAffiliationChange,
	excludeTeamId,
}: GenericInfoSectionProps) {
	const locationId = useId();
	const additionalLocationsId = useId();

	return (
		<Section title='Generic Info'>
			<Field label='Group Name'>
				<input
					type='text'
					name='name'
					defaultValue={values.name}
					required
					placeholder='e.g. Portland Velo Collective'
					className={styles.input}
				/>
			</Field>
			<Field label='Group Type'>
				<select
					name='type'
					value={groupType}
					onChange={(event) => onGroupTypeChange(event.target.value)}
					className={styles.input}
				>
					{CLUB_TYPES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			{groupType !== 'Group Ride' && (
				<Field label='Mission statement' full>
					<textarea
						name='missionStatement'
						defaultValue={values.missionStatement}
						rows={2}
						placeholder='What is this group trying to do?'
						className={styles.input}
					/>
				</Field>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Code of conduct' full>
					<textarea
						name='codeOfConduct'
						defaultValue={values.codeOfConduct}
						rows={2}
						placeholder='Any ground rules for members and rides'
						className={styles.input}
					/>
				</Field>
			)}
			<Field
				label='Affiliation'
				hint={
					affiliatedId ?
						'Linked to an existing team.'
					:	'Begin typing to search Spoke & Circle for an existing team, club, or organization to link to'
				}
			>
				<TeamAffiliationInput
					name='affiliation'
					affiliatedIdName='affiliatedId'
					value={affiliationLabel}
					affiliatedId={affiliatedId}
					onChange={onAffiliationChange}
					excludeId={excludeTeamId}
					placeholder='e.g. Team, Bike Shop, Organization, etc.'
				/>
			</Field>
			<div className={styles.field}>
				<label htmlFor={locationId} className={styles.fieldLabel}>
					Location
				</label>
				<LocationInput
					id={locationId}
					name='location'
					defaultValue={values.location}
					required
					placeholder='Start typing a US city or state'
				/>
			</div>
			{groupType !== 'Group Ride' && (
				<div className={styles.field}>
					<label htmlFor={additionalLocationsId} className={styles.fieldLabel}>
						Additional locations
					</label>
					<LocationListInput
						id={additionalLocationsId}
						name='additionalLocations'
						defaultValues={values.additionalLocations}
						placeholder='Search and add another US city or state'
					/>
					<span className={styles.fieldHint}>
						If your team has additional chapters, add each location they can be
						found, up to 10
					</span>
				</div>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Founded'>
					<input
						type='number'
						name='founded'
						defaultValue={values.founded}
						min={1970}
						max={2026}
						placeholder='2024'
						className={styles.input}
					/>
				</Field>
			)}
			<Field label='Public or private'>
				<select
					name='visibility'
					defaultValue={values.visibility}
					className={styles.input}
				>
					<option value='Public'>Public</option>
					<option value='Private'>Private</option>
				</select>
			</Field>
			<Field label='Primary language'>
				<input
					type='text'
					name='primaryLanguage'
					defaultValue={values.primaryLanguage}
					placeholder='English'
					className={styles.input}
				/>
			</Field>
			<Field label='Contact phone'>
				<input
					type='tel'
					name='contactPhone'
					defaultValue={values.contactPhone}
					placeholder='555-555-0100'
					className={styles.input}
				/>
			</Field>
			<Field label='Contact email'>
				<input
					type='email'
					name='contactEmail'
					defaultValue={values.contactEmail}
					placeholder='hello@yourteam.org'
					className={styles.input}
				/>
			</Field>
		</Section>
	);
}
