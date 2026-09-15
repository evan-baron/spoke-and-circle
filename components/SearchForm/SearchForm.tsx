interface SearchFormProps {
  defaultQ?: string;
  defaultLocation?: string;
  defaultType?: string;
}

const TYPE_OPTIONS = ["Team", "Club", "Group", "Organization"];

export function SearchForm({ defaultQ = "", defaultLocation = "", defaultType = "" }: SearchFormProps) {
  return (
    <form action="/search" method="GET">
      <div>
        <label htmlFor="q">
          Keyword
        </label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={defaultQ}
          placeholder="e.g. gravel, women only, no-drop&hellip;"
        />
      </div>
      <div>
        <label htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={defaultLocation}
          placeholder="City or state"
        />
      </div>
      <div>
        <label htmlFor="type">
          Type
        </label>
        <select id="type" name="type" defaultValue={defaultType}>
          <option value="">Any type</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">
        Find teams
      </button>
    </form>
  );
}
