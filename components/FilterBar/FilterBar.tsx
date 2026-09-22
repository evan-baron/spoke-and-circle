"use client";

import type { ChangeEvent } from "react";
import { CheckboxDropdown } from "./CheckboxDropdown";
import styles from "./filterBar.module.scss";

interface FilterBarProps {
  defaultQ?: string;
  defaultLocation?: string;
  defaultType?: string;
  defaultBikeTypes?: string[];
  defaultDiscipline?: string;
  defaultSkillLevel?: string;
  defaultCompetitiveOrCasual?: string;
  defaultWomensOnly?: boolean;
  defaultYouthOnly?: boolean;
  defaultAcceptingNewRiders?: boolean;
}

const TYPE_OPTIONS = ["Team", "Club", "Group Ride", "Youth Program", "Organization"];
const BIKE_TYPE_OPTIONS = ["Road", "Gravel", "MTB", "Track", "Tri", "E-bike", "Mixed"];
const DISCIPLINE_OPTIONS = ["Cross-country", "Trail", "Enduro", "Downhill", "All-mountain"];
const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const RACING_OPTIONS = ["Competitive", "Casual"];

function autoSubmit(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
  event.currentTarget.form?.requestSubmit();
}

export function FilterBar({
  defaultQ = "",
  defaultLocation = "",
  defaultType = "",
  defaultBikeTypes = [],
  defaultDiscipline = "",
  defaultSkillLevel = "",
  defaultCompetitiveOrCasual = "",
  defaultWomensOnly = false,
  defaultYouthOnly = false,
  defaultAcceptingNewRiders = false,
}: FilterBarProps) {
  return (
    <form action="/search" method="GET" className={styles.form}>
      <div className={styles.row}>
        <input
          name="q"
          type="text"
          defaultValue={defaultQ}
          placeholder="Keyword&hellip;"
          aria-label="Keyword"
          className={styles.input}
        />
        <input
          name="location"
          type="text"
          defaultValue={defaultLocation}
          placeholder="Location&hellip;"
          aria-label="Location"
          className={styles.input}
        />
        <select
          name="type"
          defaultValue={defaultType}
          aria-label="Type"
          onChange={autoSubmit}
          className={styles.input}
        >
          <option value="">Any type</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <CheckboxDropdown
          name="bikeType"
          label="Any bike type"
          options={BIKE_TYPE_OPTIONS}
          defaultValues={defaultBikeTypes}
        />
        <button type="submit" className={styles.submit}>
          Apply
        </button>
      </div>

      <div className={`${styles.row} ${styles.rowFilters}`}>
        <select
          name="skillLevel"
          defaultValue={defaultSkillLevel}
          aria-label="Skill level"
          onChange={autoSubmit}
          className={styles.input}
        >
          <option value="">Any skill level</option>
          {SKILL_LEVEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="competitiveOrCasual"
          defaultValue={defaultCompetitiveOrCasual}
          aria-label="Racing or recreational"
          onChange={autoSubmit}
          className={styles.input}
        >
          <option value="">Racing or recreational</option>
          {RACING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="discipline"
          defaultValue={defaultDiscipline}
          aria-label="Riding style"
          onChange={autoSubmit}
          className={styles.input}
        >
          <option value="">Any riding style</option>
          {DISCIPLINE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.toggleRow}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="womensOnly"
            value="true"
            defaultChecked={defaultWomensOnly}
            onChange={autoSubmit}
          />
          <span>Women&rsquo;s groups</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="youthOnly"
            value="true"
            defaultChecked={defaultYouthOnly}
            onChange={autoSubmit}
          />
          <span>Youth programs</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="acceptingNewRiders"
            value="true"
            defaultChecked={defaultAcceptingNewRiders}
            onChange={autoSubmit}
          />
          <span>Accepting new riders</span>
        </label>
      </div>
    </form>
  );
}
