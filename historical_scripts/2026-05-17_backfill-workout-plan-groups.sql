-- Backfill: create workout_plan_groups for orphaned workout_plans
--
-- Why this exists:
-- The TBD-50 versioning migration added workout_plan_groups and
-- workout_plan_group_id to workout_plans, but only wired up NEW plans
-- created after the migration. Existing plans retained NULL in
-- workout_plan_group_id, which means they have no group and cannot
-- be published via POST /api/workout-plan-groups/:id/publish.
--
-- What this script does:
--   1. For every workout_plan where workout_plan_group_id IS NULL
--      and deleted_at IS NULL, insert a new workout_plan_groups row
--      whose trainee_id, name, created_by, and updated_by are copied
--      from the plan.
--   2. Set workout_plan_group_id on each plan to the newly created group.
--   3. Set current_version_id on the group to the plan's id (these
--      pre-versioning plans are treated as the active published version).
--   4. Ensure version_status = 'published' on these plans so the iOS
--      client shows them with the correct Published badge.
--
-- Safety:
--   - Wrapped in a transaction; rolls back fully on any error.
--   - Uses a CTE to avoid touching plans that already have a group.
--   - Idempotent: re-running after a partial failure is safe because
--     the WHERE clause filters on workout_plan_group_id IS NULL.
--
-- Run with:
--   psql $DATABASE_URL -f historical_scripts/2026-05-17_backfill-workout-plan-groups.sql
--

BEGIN;

WITH inserted_groups AS (
    INSERT INTO workout_plan_groups (
        id,
        trainee_id,
        name,
        current_version_id,
        created_at,
        updated_at,
        created_by,
        updated_by
    )
    SELECT
        -- Generate a stable CUID2-compatible id using gen_random_uuid() as a
        -- stand-in; replace with your preferred id generator if needed.
        gen_random_uuid()::text AS id,
        wp.trainee_id,
        wp.name,
        wp.id AS current_version_id,
        wp.created_at,
        wp.updated_at,
        wp.created_by,
        wp.updated_by
    FROM workout_plans wp
    WHERE wp.workout_plan_group_id IS NULL
      AND wp.deleted_at IS NULL
    RETURNING id, current_version_id
)
UPDATE workout_plans wp
SET
    workout_plan_group_id = ig.id,
    version_status        = 'published',
    updated_at            = NOW()
FROM inserted_groups ig
WHERE wp.id = ig.current_version_id;

-- Sanity check: print how many plans were migrated.
SELECT COUNT(*) AS plans_backfilled
FROM workout_plans
WHERE workout_plan_group_id IS NOT NULL
  AND deleted_at IS NULL
  AND updated_at >= NOW() - INTERVAL '5 seconds';

COMMIT;
