import type { TeamFormValues } from '@/lib/types';
import { Checkbox } from './Checkbox';
import {
	BIKE_TYPES,
	FORMATS,
	PACES,
	PERSONA_OPTIONS,
	VIRTUAL_PLATFORMS,
} from './constants';
import { Field } from './Field';
import { Section } from './Section';
import { SkillLevelsField } from './SkillLevelsField';
import styles from './teamForm.module.scss';

interface DetailsSectionProps {
	values: TeamFormValues;
	groupType: string;
	virtualPlatforms: string[];
	onVirtualPlatformChange: (value: string) => void;
	virtualPlatformOtherText: string;
	onVirtualPlatformOtherTextChange: (value: string) => void;
	personaRestriction: string | null;
	onPersonaChange: (value: string) => void;
	personaOtherText: string;
	onPersonaOtherTextChange: (value: string) => void;
}

export function DetailsSection({
	values,
	groupType,
	virtualPlatforms,
	onVirtualPlatformChange,
	virtualPlatformOtherText,
	onVirtualPlatformOtherTextChange,
	personaRestriction,
	onPersonaChange,
	personaOtherText,
	onPersonaOtherTextChange,
}: DetailsSectionProps) {
	return (
		<Section
			title={groupType === 'Group Ride' ? 'Group Ride Profile' : 'Group Profile'}
		>
			<Field label='Cycling Discipline'>
				<select
					name='bikeType'
					defaultValue={values.bikeType}
					className={styles.input}
				>
					{BIKE_TYPES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Virtual or in-person'>
				<select
					name='format'
					defaultValue={values.format}
					className={styles.input}
				>
					{FORMATS.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<Field label='Average Riding Pace'>
				<select name='pace' defaultValue={values.pace} className={styles.input}>
					{PACES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</Field>
			<SkillLevelsField defaultValues={values.skillLevels} />

			{groupType !== 'Group Ride' && (
				<Field
					label='Home Base'
					hint='The shop, venue, league, or organization your group is based out of or belongs to. Ex: The Broken Spoke Bike Shop'
				>
					<input
						type='text'
						name='homeBase'
						defaultValue={values.homeBase}
						placeholder='e.g. Zwift Racing League'
						className={styles.input}
					/>
				</Field>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Website'>
					<input
						type='url'
						name='website'
						defaultValue={values.website}
						placeholder='https://'
						className={styles.input}
					/>
				</Field>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Instagram'>
					<input
						type='text'
						name='instagram'
						defaultValue={values.instagram}
						placeholder='@yourteam'
						className={styles.input}
					/>
				</Field>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Facebook'>
					<input
						type='text'
						name='facebook'
						defaultValue={values.facebook}
						placeholder='Page name'
						className={styles.input}
					/>
				</Field>
			)}
			<Field label='Strava'>
				<input
					type='text'
					name='strava'
					defaultValue={values.strava}
					placeholder='Club name'
					className={styles.input}
				/>
			</Field>
			<Field label='Discord'>
				<input
					type='text'
					name='discord'
					defaultValue={values.discord}
					placeholder='discord.gg/&hellip;'
					className={styles.input}
				/>
			</Field>
			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Platform(s)</span>
				<div className={styles.checkboxRow}>
					{VIRTUAL_PLATFORMS.map((platform) => (
						<Checkbox
							key={platform}
							label={platform}
							name='virtualPlatform'
							value={platform}
							checked={virtualPlatforms.includes(platform)}
							onChange={() => onVirtualPlatformChange(platform)}
						/>
					))}
				</div>
				{virtualPlatforms.includes('Other') && (
					<input
						type='text'
						name='virtualPlatformOtherDescription'
						placeholder='Please describe'
						value={virtualPlatformOtherText}
						onChange={(event) =>
							onVirtualPlatformOtherTextChange(event.target.value)
						}
						className={styles.input}
					/>
				)}
			</div>
			<Field label='Minimum age'>
				<input
					type='number'
					name='ageMin'
					defaultValue={values.ageMin}
					min={0}
					max={120}
					className={styles.input}
				/>
			</Field>
			{groupType !== 'Group Ride' && (
				<Field label='Maximum age'>
					<input
						type='number'
						name='ageMax'
						defaultValue={values.ageMax}
						min={0}
						max={120}
						className={styles.input}
					/>
				</Field>
			)}
			{groupType !== 'Group Ride' && (
				<Field label='Current member count'>
					<input
						type='number'
						name='memberCount'
						defaultValue={values.memberCount}
						min={0}
						className={styles.input}
					/>
				</Field>
			)}
			<Field label='Maximum member limit'>
				<input
					type='number'
					name='memberLimit'
					defaultValue={values.memberLimit}
					min={0}
					className={styles.input}
				/>
			</Field>
			<Field label='How to join' full>
				<textarea
					name='howToJoin'
					defaultValue={values.howToJoin}
					rows={2}
					placeholder={
						groupType !== 'Group Ride' ?
							'What should a prospective member do?'
						:	'What should a prospective rider do?'
					}
					className={styles.input}
				/>
			</Field>

			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Persona restrictions</span>
				<div className={styles.checkboxRow}>
					{PERSONA_OPTIONS.map((option) => (
						<Checkbox
							key={option.value}
							label={option.label}
							name='personaRestriction'
							value={option.value}
							checked={personaRestriction === option.value}
							onChange={() => onPersonaChange(option.value)}
						/>
					))}
				</div>
				{personaRestriction === 'other' && (
					<input
						type='text'
						name='personaOtherDescription'
						placeholder='Please describe'
						value={personaOtherText}
						onChange={(event) => onPersonaOtherTextChange(event.target.value)}
						className={styles.input}
					/>
				)}
			</div>
			<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
				<span className={styles.fieldLabel}>Other restrictions</span>

				<div className={styles.checkboxRow}>
					<Checkbox
						label='E-bike allowed'
						name='eBikeAllowed'
						defaultChecked={values.eBikeAllowed}
					/>
					{groupType !== 'Group Ride' && (
						<Checkbox
							label='Waitlist active'
							name='waitlist'
							defaultChecked={values.waitlist}
						/>
					)}
				</div>
			</div>
		</Section>
	);
}
