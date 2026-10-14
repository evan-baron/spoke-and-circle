UPDATE "Team"
SET "personaRestrictions" = array_replace("personaRestrictions", 'LGBT Only', 'LGBTQ+ Only')
WHERE 'LGBT Only' = ANY("personaRestrictions");
