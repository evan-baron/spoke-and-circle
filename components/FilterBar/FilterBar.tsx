"use client";

import type { FormEvent } from "react";
import styles from "./filterBar.module.scss";

interface FilterBarProps {
  defaultQ?: string;
  defaultLocation?: string;
  defaultType?: string;
  defaultBikeType?: string;
}

const TYPE_OPTIONS = ["Team", "Club", "Group", "Organization"];
const BIKE_TYPE_OPTIONS = ["Road", "Gravel", "MTB", "Track", "Tri", "E-bike", "Mixed"];

function autoSubmit(event: FormEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

export function FilterBar({
  defaultQ = "",
  defaultLocation = "",
  defaultType = "",
  defaultBikeType = "",
}: FilterBarProps) {
  return (
    <form action="/search" method="GET" className={styles.form}>
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
      <select
        name="bikeType"
        defaultValue={defaultBikeType}
        aria-label="Bike type"
        onChange={autoSubmit}
        className={styles.input}
      >
        <option value="">Any bike type</option>
        {BIKE_TYPE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button type="submit" className={styles.submit}>
        Apply
      </button>
    </form>
  );
}
