import styles from "./searchForm.module.scss";

interface SearchFormProps {
  defaultQ?: string;
  defaultLocation?: string;
  defaultType?: string;
}

const TYPE_OPTIONS = ["Team", "Club", "Group", "Organization"];

export function SearchForm({ defaultQ = "", defaultLocation = "", defaultType = "" }: SearchFormProps) {
  return (
    <form action="/search" method="GET" className={styles.form}>
      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label htmlFor="q" className={styles.label}>
          Keyword
        </label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={defaultQ}
          placeholder="e.g. gravel, women only, no-drop&hellip;"
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="location" className={styles.label}>
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={defaultLocation}
          placeholder="City or state"
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="type" className={styles.label}>
          Type
        </label>
        <select id="type" name="type" defaultValue={defaultType} className={styles.input}>
          <option value="">Any type</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={styles.submit}>
        Find teams
      </button>
    </form>
  );
}
