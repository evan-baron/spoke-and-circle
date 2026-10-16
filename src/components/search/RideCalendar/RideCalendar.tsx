'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import {
	formatClockTime,
	formatRideRecurrence,
	formatSkillLevelLines,
} from '@/lib/format';
import { expandRide, fromDayNumber, toDayNumber } from '@/lib/rideSchedule';
import { formatTimeZoneLabel } from '@/lib/timeZone';
import { toneForPace } from '@/lib/tone';
import type { CalendarRide } from '@/lib/types';
import styles from './rideCalendar.module.scss';

interface RideCalendarProps {
	rides: CalendarRide[];
	initialMonth: string;
	todayIso: string;
	total: number;
	truncated: boolean;
}

interface DayEntry {
	ride: CalendarRide;
	time: string | undefined;
}

const MAX_CHIPS = 3;
const WEEKDAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

const monthFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC',
});

function monthKeyOf(isoDate: string): string {
	return isoDate.slice(0, 7);
}

function shiftMonth(key: string, delta: number): string {
	const [year = 1970, month = 1] = key.split('-').map(Number);
	const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
	return shifted.toISOString().slice(0, 7);
}

function localTodayIso(): string {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}

function compareEntries(a: DayEntry, b: DayEntry): number {
	if (a.time && b.time) return a.time.localeCompare(b.time);
	if (a.time) return -1;
	if (b.time) return 1;
	return a.ride.name.localeCompare(b.ride.name);
}

function buildWeeks(monthKey: string): string[][] {
	const firstOfMonth = toDayNumber(`${monthKey}-01`);
	const leading = new Date(`${monthKey}-01T00:00:00Z`).getUTCDay();
	const nextMonth = toDayNumber(`${shiftMonth(monthKey, 1)}-01`);
	const totalDays = nextMonth - firstOfMonth;
	const weekCount = Math.ceil((leading + totalDays) / 7);
	const start = firstOfMonth - leading;

	return Array.from({ length: weekCount }, (_, week) =>
		Array.from({ length: 7 }, (_, day) =>
			fromDayNumber(start + week * 7 + day),
		),
	);
}

function entryLabel(entry: DayEntry): string {
	const time = entry.time ? `${formatClockTime(entry.time)}, ` : '';
	return `${time}${entry.ride.name}, ${entry.ride.pace} pace`;
}

export function RideCalendar({
	rides,
	initialMonth,
	todayIso,
	total,
	truncated,
}: RideCalendarProps) {
	const [monthKey, setMonthKey] = useState(initialMonth);
	const [today, setToday] = useState(todayIso);
	const [selected, setSelected] = useState<string | null>(null);
	const panelRef = useRef<HTMLElement>(null);

	useEffect(() => {
		setToday(localTodayIso());
	}, []);

	const weeks = useMemo(() => buildWeeks(monthKey), [monthKey]);

	const occurrences = useMemo(() => {
		const first = weeks[0]?.[0];
		const last = weeks[weeks.length - 1]?.[6];
		const byDate = new Map<string, DayEntry[]>();
		if (!first || !last) return byDate;

		for (const ride of rides) {
			for (const date of expandRide(ride.ride, first, last)) {
				const entries = byDate.get(date) ?? [];
				entries.push({ ride, time: ride.ride.startTime });
				byDate.set(date, entries);
			}
		}
		for (const entries of byDate.values()) entries.sort(compareEntries);
		return byDate;
	}, [rides, weeks]);

	const monthTotal = useMemo(() => {
		let count = 0;
		for (const [date, entries] of occurrences) {
			if (monthKeyOf(date) === monthKey) count += entries.length;
		}
		return count;
	}, [occurrences, monthKey]);

	const activeDate =
		selected ?? (monthKeyOf(today) === monthKey ? today : `${monthKey}-01`);
	const activeEntries = occurrences.get(activeDate) ?? [];

	function goToMonth(key: string) {
		setMonthKey(key);
		setSelected(null);
		const url = new URL(window.location.href);
		url.searchParams.set('month', key);
		window.history.replaceState(null, '', url);
	}

	function selectDay(date: string) {
		setSelected(date);
		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		requestAnimationFrame(() => {
			panelRef.current?.scrollIntoView({
				block: 'nearest',
				behavior: reduceMotion ? 'auto' : 'smooth',
			});
		});
	}

	const monthLabel = monthFormatter.format(
		new Date(`${monthKey}-01T00:00:00Z`),
	);

	return (
		<section className={styles.calendar} aria-label='Group ride calendar'>
			<div className={styles.toolbar}>
				<div className={styles.nav}>
					<button
						type='button'
						className={styles.navButton}
						onClick={() => goToMonth(monthKeyOf(today))}
					>
						Today
					</button>
					<button
						type='button'
						className={styles.navButton}
						onClick={() => goToMonth(shiftMonth(monthKey, -1))}
						aria-label='Previous month'
					>
						&larr;
					</button>
					<button
						type='button'
						className={styles.navButton}
						onClick={() => goToMonth(shiftMonth(monthKey, 1))}
						aria-label='Next month'
					>
						&rarr;
					</button>
				</div>
				<h2 className={styles.monthTitle} aria-live='polite'>
					{monthLabel}
				</h2>
			</div>

			{truncated && (
				<p className={styles.notice}>
					Showing the first {rides.length} of {total} group rides. Add a
					location to narrow the calendar.
				</p>
			)}

			<table className={styles.grid} aria-label={monthLabel}>
				<thead>
					<tr>
						{WEEKDAYS.map((weekday) => (
							<th key={weekday} scope='col' aria-label={weekday}>
								<span className={styles.dayFull} aria-hidden='true'>
									{weekday.slice(0, 3)}
								</span>
								<span className={styles.dayShort} aria-hidden='true'>
									{weekday.slice(0, 1)}
								</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{weeks.map((week) => (
						<tr key={week[0]}>
							{week.map((date) => {
								const entries = occurrences.get(date) ?? [];
								const inMonth = monthKeyOf(date) === monthKey;
								const isToday = date === today;
								const isActive = date === activeDate;
								const countLabel =
									entries.length === 0 ? 'no rides'
									: entries.length === 1 ? '1 ride'
									: `${entries.length} rides`;
								const label = `${dayFormatter.format(new Date(`${date}T00:00:00Z`))}, ${countLabel}`;
								const cellClass = [
									styles.cell,
									inMonth ? '' : styles.outside,
									date < today ? styles.past : '',
									isToday ? styles.today : '',
									isActive ? styles.active : '',
								]
									.filter(Boolean)
									.join(' ');

								return (
									<td
										key={date}
										className={cellClass}
										onClick={() => selectDay(date)}
									>
										<div className={styles.cellInner}>
											<button
												type='button'
												className={styles.dayButton}
												aria-label={label}
												aria-pressed={isActive}
											>
												<span className={styles.dayNumber}>
													{Number(date.slice(8))}
												</span>
												{entries.length > 0 && (
													<span className={styles.dots} aria-hidden='true'>
														{entries.slice(0, MAX_CHIPS).map((entry) => (
															<span
																key={entry.ride.id}
																className={styles.dot}
															/>
														))}
													</span>
												)}
											</button>
											{entries.length > 0 && (
												<ul className={styles.chips}>
													{entries.map((entry) => (
														<li key={entry.ride.id}>
															<button
																type='button'
																className={styles.chip}
																aria-label={entryLabel(entry)}
															>
																{entry.time && (
																	<span className={styles.chipTime}>
																		{formatClockTime(entry.time)}
																	</span>
																)}
																<span className={styles.chipName}>
																	{entry.ride.name}
																</span>
															</button>
														</li>
													))}
												</ul>
											)}
										</div>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>

			{monthTotal === 0 && (
				<p className={styles.empty}>
					No group rides are scheduled this month with these filters.
				</p>
			)}

			<section
				ref={panelRef}
				className={styles.panel}
				aria-live='polite'
				aria-label='Rides on selected day'
			>
				<h3 className={styles.panelTitle}>
					{dayFormatter.format(new Date(`${activeDate}T00:00:00Z`))}
				</h3>
				{activeEntries.length === 0 ?
					<p className={styles.panelEmpty}>No group rides on this day.</p>
				:	<ul className={styles.agenda}>
						{activeEntries.map((entry) => {
							const timeZone = formatTimeZoneLabel(entry.ride.timeZone);
							return (
								<li key={entry.ride.id} className={styles.agendaItem}>
									<div className={styles.agendaTime}>
										{entry.time ?
											<>
												<strong>{formatClockTime(entry.time)}</strong>
												{timeZone && <span>{timeZone}</span>}
											</>
										:	<span>Time TBD</span>}
									</div>
									<div className={styles.agendaBody}>
										<Link
											href={`/group-rides/${entry.ride.id}`}
											className={styles.agendaName}
										>
											<span className={styles.agendaNameText}>
												{entry.ride.name}
											</span>
										</Link>
										<p className={styles.agendaMeta}>
											{entry.ride.location} &middot;{' '}
											{formatRideRecurrence(entry.ride.ride)}
										</p>
										<div className={styles.agendaBadges}>
											<Badge tone={toneForPace(entry.ride.pace)}>
												{entry.ride.pace} pace
											</Badge>
											<Badge tone='ink'>{entry.ride.dropPolicy}</Badge>
											{formatSkillLevelLines(entry.ride.skillLevels).map(
												(level) => (
													<Badge key={level} tone='ink'>
														{level}
													</Badge>
												),
											)}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				}
			</section>
		</section>
	);
}
