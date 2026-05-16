-- Recovery script: apply missing schema from migration 0013
--
-- Why this exists:
-- On 2026-05-16, migration 0013_versioning_and_sets was deployed to production
-- as part of TBD-50/TBD-63. The migration hash was recorded in
-- __drizzle_migrations (row 14) but the SQL itself failed partway through —
-- most likely at "CREATE TABLE workout_plan_groups" because the table had
-- already been created by a prior failed attempt. Because Drizzle had already
-- marked the migration as applied, re-running `db:migrate` would not retry it,
-- leaving the production DB stuck: no version_status column, no workout_sets
-- table, none of the new workout columns. The app crashed on every page load
-- with "column version_status does not exist".
--
-- This script applies all the schema objects that 0013 was supposed to create,
-- with IF NOT EXISTS / exception-handler guards so it is safe to run on a DB
-- where some objects were already created by the partial run.
--
-- After running this script, run `pnpm db:migrate` (with the correct
-- DATABASE_URL_UNPOOLED) to let Drizzle apply 0014 and 0015 normally.
--
-- DO NOT run this on a fresh database — `pnpm db:migrate` handles fresh
-- databases correctly on its own; this script is only for recovering the
-- broken production state described above.

-- ── New tables ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "workout_plan_groups" (
  "id" text PRIMARY KEY NOT NULL,
  "trainee_id" text NOT NULL,
  "name" text NOT NULL,
  "current_version_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "workout_sets" (
  "id" text PRIMARY KEY NOT NULL,
  "workout_id" text NOT NULL,
  "exercise_id" text NOT NULL,
  "position" integer NOT NULL,
  "reps" integer,
  "duration_seconds" integer,
  "weight_lbs" real,
  "completed" boolean DEFAULT false NOT NULL,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "rpe" integer,
  "rir" integer,
  "video_id" text,
  "comment" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "pain_flags" (
  "id" text PRIMARY KEY NOT NULL,
  "workout_id" text NOT NULL,
  "exercise_id" text,
  "workout_set_id" text,
  "location" text NOT NULL,
  "severity" integer NOT NULL,
  "is_recurring" boolean DEFAULT false NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "workout_tags" (
  "workout_id" text NOT NULL,
  "tag_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  CONSTRAINT "workout_tags_workout_id_tag_id_pk" PRIMARY KEY ("workout_id", "tag_id")
);

-- ── Columns on workout_plans ─────────────────────────────────────────────────

ALTER TABLE "workout_plans" ADD COLUMN IF NOT EXISTS "workout_plan_group_id" text;
ALTER TABLE "workout_plans" ADD COLUMN IF NOT EXISTS "version_status" text DEFAULT 'draft' NOT NULL;
ALTER TABLE "workout_plans" ADD COLUMN IF NOT EXISTS "version_number" integer DEFAULT 1 NOT NULL;
ALTER TABLE "workout_plans" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;

-- ── Column on exercises ──────────────────────────────────────────────────────

ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;

-- ── Columns on workouts ──────────────────────────────────────────────────────

ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "pre_session_energy" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "pre_session_soreness" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "pre_session_stress" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "pre_session_note" text;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "post_session_energy" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "session_quality" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "session_quality_rated_by" text;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "session_quality_rated_at" timestamp with time zone;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "trainee_rating" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "trainee_rating_rated_at" timestamp with time zone;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "total_volume_lbs" real;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "total_work_seconds" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "total_rest_seconds" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "adherence_percent" real;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "average_rpe" real;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "pain_flag_count" integer;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

-- ── Check constraints ────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE "workouts" DROP CONSTRAINT "workouts_energy_rating_range";
EXCEPTION WHEN undefined_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_post_session_energy_range"
  CHECK ("workouts"."post_session_energy" IS NULL OR ("workouts"."post_session_energy" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_energy_range"
  CHECK ("workouts"."pre_session_energy" IS NULL OR ("workouts"."pre_session_energy" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_soreness_range"
  CHECK ("workouts"."pre_session_soreness" IS NULL OR ("workouts"."pre_session_soreness" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_stress_range"
  CHECK ("workouts"."pre_session_stress" IS NULL OR ("workouts"."pre_session_stress" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_session_quality_range"
  CHECK ("workouts"."session_quality" IS NULL OR ("workouts"."session_quality" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainee_rating_range"
  CHECK ("workouts"."trainee_rating" IS NULL OR ("workouts"."trainee_rating" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_rpe_range"
  CHECK ("workout_sets"."rpe" IS NULL OR ("workout_sets"."rpe" BETWEEN 1 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_rir_range"
  CHECK ("workout_sets"."rir" IS NULL OR ("workout_sets"."rir" BETWEEN 0 AND 10));
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_severity_range"
  CHECK ("pain_flags"."severity" BETWEEN 1 AND 10);
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- ── Foreign keys ─────────────────────────────────────────────────────────────

DO $$ BEGIN ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_trainee_id_users_id_fk"
  FOREIGN KEY ("trainee_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_current_version_id_workout_plans_id_fk"
  FOREIGN KEY ("current_version_id") REFERENCES "workout_plans"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_updated_by_users_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_workout_plan_group_id_workout_plan_groups_id_fk"
  FOREIGN KEY ("workout_plan_group_id") REFERENCES "workout_plan_groups"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk"
  FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_video_id_videos_id_fk"
  FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_updated_by_users_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_id_workouts_id_fk"
  FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_exercise_id_exercises_id_fk"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_set_id_workout_sets_id_fk"
  FOREIGN KEY ("workout_set_id") REFERENCES "workout_sets"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_workout_id_workouts_id_fk"
  FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_tag_id_tags_id_fk"
  FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN ALTER TABLE "workouts" ADD CONSTRAINT "workouts_session_quality_rated_by_users_id_fk"
  FOREIGN KEY ("session_quality_rated_by") REFERENCES "users"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "workout_plan_groups_trainee_idx" ON "workout_plan_groups" ("trainee_id");
CREATE INDEX IF NOT EXISTS "workout_plan_groups_current_version_idx" ON "workout_plan_groups" ("current_version_id");
CREATE INDEX IF NOT EXISTS "workout_plans_group_idx" ON "workout_plans" ("workout_plan_group_id");
CREATE INDEX IF NOT EXISTS "workout_sets_workout_exercise_idx" ON "workout_sets" ("workout_id", "exercise_id", "position");
CREATE INDEX IF NOT EXISTS "workout_sets_workout_idx" ON "workout_sets" ("workout_id");
CREATE INDEX IF NOT EXISTS "workout_sets_exercise_idx" ON "workout_sets" ("exercise_id");
CREATE INDEX IF NOT EXISTS "workout_sets_video_idx" ON "workout_sets" ("video_id");
CREATE INDEX IF NOT EXISTS "pain_flags_workout_idx" ON "pain_flags" ("workout_id");
CREATE INDEX IF NOT EXISTS "pain_flags_exercise_idx" ON "pain_flags" ("exercise_id");
CREATE INDEX IF NOT EXISTS "pain_flags_workout_set_idx" ON "pain_flags" ("workout_set_id");
CREATE INDEX IF NOT EXISTS "workout_tags_tag_idx" ON "workout_tags" ("tag_id");
