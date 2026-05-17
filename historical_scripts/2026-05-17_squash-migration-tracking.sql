-- Reset Drizzle migration tracking after squashing 18 migrations into 0000_baseline.sql.
-- Run this ONCE against production after the baseline squash commit (bf1564b).
-- The deleted_at column on workout_plan_groups must already exist before running this.

TRUNCATE drizzle.__drizzle_migrations;

INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES ('b8715bccdc809d60b7e742b43a386b0e2b3b086bb7ab1b551dbcccf67fbac8f3', 1779002899097);
