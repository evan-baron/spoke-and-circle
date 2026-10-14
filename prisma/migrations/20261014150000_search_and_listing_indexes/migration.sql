CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Team" ADD COLUMN "skillSpecificity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "searchText" TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION team_derive_search_columns() RETURNS trigger AS $$
BEGIN
	NEW."skillSpecificity" := COALESCE(cardinality(NEW."skillLevels"), 0);
	NEW."searchText" := concat_ws(
		' | ',
		NEW."name",
		NEW."missionStatement",
		NEW."location",
		NEW."affiliation",
		NEW."homeBase",
		array_to_string(NEW."tags", ' | '),
		array_to_string(NEW."personaRestrictions", ' | '),
		array_to_string(NEW."sponsors", ' | '),
		array_to_string(NEW."eventTypes", ' | '),
		array_to_string(NEW."additionalLocations", ' | ')
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_derive_search_columns
BEFORE INSERT OR UPDATE ON "Team"
FOR EACH ROW EXECUTE FUNCTION team_derive_search_columns();

UPDATE "Team" SET "name" = "name";

DROP INDEX "Team_status_idx";
DROP INDEX "Team_location_idx";

CREATE INDEX "Team_status_name_id_idx" ON "Team"("status", "name", "id");
CREATE INDEX "Team_status_createdAt_idx" ON "Team"("status", "createdAt");
CREATE INDEX "Team_name_trgm_idx" ON "Team" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Team_location_trgm_idx" ON "Team" USING GIN ("location" gin_trgm_ops);
CREATE INDEX "Team_searchText_trgm_idx" ON "Team" USING GIN ("searchText" gin_trgm_ops);
