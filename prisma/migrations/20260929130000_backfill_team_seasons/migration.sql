-- Backfill: rows created before "seasons" existed have NULL instead of '{}',
-- which breaks the always-array guarantee every other Team list column has.
UPDATE "Team" SET "seasons" = '{}' WHERE "seasons" IS NULL;
