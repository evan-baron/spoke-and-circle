'use client';

import { useState } from 'react';
import type { Ride, RideOrdinal, RidePattern } from '@/lib/types';
import { Checkbox } from './Checkbox';
import { DAYS, MONTHS, RIDE_ORDINALS, RIDE_PATTERNS } from './constants';
import { Field } from './Field';
import formStyles from './teamForm.module.scss';
import styles from './rideScheduleEditor.module.scss';

const DEFAULT_MONTH_FROM = 3;
const DEFAULT_MONTH_TO = 10;

const BLANK_RIDE: Ride = { pattern: 'weekly', days: [] };

function cleanRide(ride: Ride): Ride | null {
	const details = ride.details?.trim();

	if (ride.days.length === 0 && !details && !ride.startTime) return null;

	return {
		pattern: ride.pattern,
		days: ride.days,
		...(ride.pattern === 'monthly' && ride.ordinals?.length ?
			{ ordinals: ride.ordinals }
		:	{}),
		...(ride.pattern === 'biweekly' && ride.startDate ?
			{ startDate: ride.startDate }
		:	{}),
		...(ride.startTime ? { startTime: ride.startTime } : {}),
		...(ride.monthFrom !== undefined && ride.monthTo !== undefined ?
			{ monthFrom: ride.monthFrom, monthTo: ride.monthTo }
		:	{}),
		...(details ? { details } : {}),
	};
}

function toggle<T>(items: T[], item: T): T[] {
	return items.includes(item) ?
			items.filter((entry) => entry !== item)
		:	[...items, item];
}

interface RideScheduleEditorProps {
	initialRide?: Ride;
}

export function RideScheduleEditor({ initialRide }: RideScheduleEditorProps) {
	const [ride, setRide] = useState<Ride>(initialRide ?? BLANK_RIDE);

	function updateRide(patch: Partial<Ride>) {
		setRide((prev) => ({ ...prev, ...patch }));
	}

	const limitMonths = ride.monthFrom !== undefined;
	const cleaned = cleanRide(ride);

	return (
		<div className={`${formStyles.checkboxGroup} ${formStyles.fieldFull}`}>
			<span className={formStyles.fieldLabel}>Schedule</span>
			<div className={styles.grid}>
				<Field label='Repeats'>
					<select
						value={ride.pattern}
						onChange={(event) =>
							updateRide({ pattern: event.target.value as RidePattern })
						}
						className={formStyles.input}
					>
						{RIDE_PATTERNS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</Field>

				<Field label='Start time'>
					<input
						type='time'
						value={ride.startTime ?? ''}
						onChange={(event) => updateRide({ startTime: event.target.value })}
						className={formStyles.input}
					/>
				</Field>

				<div className={`${styles.group} ${styles.full}`}>
					<span className={formStyles.fieldLabel}>
						{ride.pattern === 'monthly' ? 'Day of the week' : 'Days'}
					</span>
					<div className={styles.chips}>
						{DAYS.map((day) => (
							<Checkbox
								key={day}
								label={day.slice(0, 3)}
								name='rideEditorDay'
								checked={ride.days.includes(day)}
								onChange={() =>
									updateRide({
										days: DAYS.filter((entry) =>
											entry === day ?
												!ride.days.includes(day)
											:	ride.days.includes(entry),
										),
									})
								}
							/>
						))}
					</div>
				</div>

				{ride.pattern === 'monthly' && (
					<div className={`${styles.group} ${styles.full}`}>
						<span className={formStyles.fieldLabel}>
							Which weeks of the month
						</span>
						<div className={styles.chips}>
							{RIDE_ORDINALS.map((ordinal) => (
								<Checkbox
									key={ordinal}
									label={ordinal}
									name='rideEditorOrdinal'
									checked={ride.ordinals?.includes(ordinal as RideOrdinal)}
									onChange={() =>
										updateRide({
											ordinals: toggle(
												ride.ordinals ?? [],
												ordinal as RideOrdinal,
											),
										})
									}
								/>
							))}
						</div>
					</div>
				)}

				{ride.pattern === 'biweekly' && (
					<Field
						label='Date of a ride'
						hint='Pick any date this ride happens, so we know which weeks you meet'
						full
					>
						<input
							type='date'
							value={ride.startDate ?? ''}
							onChange={(event) => updateRide({ startDate: event.target.value })}
							className={formStyles.input}
						/>
					</Field>
				)}

				<div className={`${styles.group} ${styles.full}`}>
					<span className={formStyles.fieldLabel}>Months</span>
					<Checkbox
						label='Only part of the year'
						name='rideEditorLimitMonths'
						checked={limitMonths}
						onChange={() =>
							updateRide(
								limitMonths ?
									{ monthFrom: undefined, monthTo: undefined }
								:	{
										monthFrom: DEFAULT_MONTH_FROM,
										monthTo: DEFAULT_MONTH_TO,
									},
							)
						}
					/>
				</div>

				{limitMonths && (
					<>
						<Field label='From'>
							<select
								value={ride.monthFrom}
								onChange={(event) =>
									updateRide({ monthFrom: Number(event.target.value) })
								}
								className={formStyles.input}
							>
								{MONTHS.map((month, i) => (
									<option key={month} value={i + 1}>
										{month}
									</option>
								))}
							</select>
						</Field>
						<Field label='Through'>
							<select
								value={ride.monthTo}
								onChange={(event) =>
									updateRide({ monthTo: Number(event.target.value) })
								}
								className={formStyles.input}
							>
								{MONTHS.map((month, i) => (
									<option key={month} value={i + 1}>
										{month}
									</option>
								))}
							</select>
						</Field>
					</>
				)}

				<Field
					label='Details'
					hint='Meeting spot, start and finish, anything riders should know'
					full
				>
					<input
						type='text'
						maxLength={300}
						value={ride.details ?? ''}
						placeholder='e.g. Meet at the shop, loop returns by noon'
						onChange={(event) => updateRide({ details: event.target.value })}
						className={formStyles.input}
					/>
				</Field>
			</div>
			<input
				type='hidden'
				name='rides'
				value={JSON.stringify(cleaned ? [cleaned] : [])}
			/>
		</div>
	);
}
