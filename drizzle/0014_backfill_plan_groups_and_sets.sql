-- ── Step 1: Copy energy_rating → post_session_energy ───────────
-- Preserve existing data before the old column is dropped in 0015.

UPDATE "workouts"
SET "post_session_energy" = "energy_rating"
WHERE "energy_rating" IS NOT NULL;
--> statement-breakpoint

-- ── Step 2: Create one workout_plan_group per workout_plan ──────
-- Each existing plan (including soft-deleted) gets its own group.
-- We use 'wpg_' || plan.id as a deterministic temp id so we can
-- cross-reference without needing gen_random_uuid().

INSERT INTO "workout_plan_groups" (
  "id", "trainee_id", "name",
  "created_at", "updated_at", "created_by", "updated_by"
)
SELECT
  'wpg_' || wp."id",
  wp."trainee_id",
  wp."name",
  wp."created_at",
  wp."updated_at",
  wp."created_by",
  wp."updated_by"
FROM "workout_plans" wp;
--> statement-breakpoint

-- ── Step 3: Link each plan to its group ─────────────────────────

UPDATE "workout_plans" wp
SET
  "workout_plan_group_id" = 'wpg_' || wp."id",
  "version_number" = 1,
  "version_status" = CASE
    WHEN wp."deleted_at" IS NOT NULL THEN 'archived'
    ELSE 'published'
  END,
  "published_at" = CASE
    WHEN wp."deleted_at" IS NULL THEN wp."occurred_at"
    ELSE NULL
  END;
--> statement-breakpoint

-- ── Step 4: Point each group at its published plan ──────────────

UPDATE "workout_plan_groups" wpg
SET "current_version_id" = wp."id"
FROM "workout_plans" wp
WHERE wp."workout_plan_group_id" = wpg."id"
  AND wp."version_status" = 'published';
--> statement-breakpoint

-- ── Step 5: Enforce NOT NULL on workout_plan_group_id ───────────
-- All rows are populated; now lock it down.

ALTER TABLE "workout_plans" ALTER COLUMN "workout_plan_group_id" SET NOT NULL;
--> statement-breakpoint

-- ── Step 6: Unpack sets_data JSONB → workout_sets rows ──────────
-- Each element in the array becomes one row; position = 0-based index.

INSERT INTO "workout_sets" (
  "id", "workout_id", "exercise_id", "position",
  "reps", "duration_seconds", "weight_lbs", "completed",
  "created_at", "updated_at", "created_by", "updated_by"
)
SELECT
  'ws_' || we."workout_id" || '_' || we."exercise_id" || '_' || (ord - 1),
  we."workout_id",
  we."exercise_id",
  (ord - 1)::integer AS position,
  (elem->>'reps')::integer,
  (elem->>'durationSeconds')::integer,
  (elem->>'weightLbs')::real,
  COALESCE((elem->>'completed')::boolean, false),
  we."created_at",
  we."updated_at",
  we."created_by",
  we."updated_by"
FROM "workout_exercises" we,
  jsonb_array_elements(we."sets_data") WITH ORDINALITY AS t(elem, ord)
WHERE we."sets_data" IS NOT NULL
  AND jsonb_array_length(we."sets_data") > 0;
--> statement-breakpoint

-- ── Step 7: Recompute aggregate columns on workouts ─────────────

UPDATE "workouts" w
SET
  "total_volume_lbs" = agg."total_volume_lbs",
  "total_work_seconds" = agg."total_work_seconds",
  "adherence_percent" = agg."adherence_percent",
  "pain_flag_count" = 0
FROM (
  SELECT
    ws."workout_id",
    NULLIF(SUM(
      CASE
        WHEN ws."completed" AND ws."reps" IS NOT NULL AND ws."weight_lbs" IS NOT NULL
        THEN ws."weight_lbs" * ws."reps"
        ELSE 0
      END
    ), 0) AS total_volume_lbs,
    NULLIF(SUM(
      CASE
        WHEN ws."completed" AND ws."duration_seconds" IS NOT NULL
        THEN ws."duration_seconds"
        ELSE 0
      END
    ), 0) AS total_work_seconds,
    ROUND(
      100.0 * COUNT(CASE WHEN ws."completed" THEN 1 END)::numeric
        / NULLIF(COUNT(*), 0),
      2
    )::real AS adherence_percent
  FROM "workout_sets" ws
  GROUP BY ws."workout_id"
) agg
WHERE w."id" = agg."workout_id";
