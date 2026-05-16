-- ── New tables ───────────────────────────────────────────────────

CREATE TABLE "workout_plan_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"trainee_id" text NOT NULL,
	"name" text NOT NULL,
	"current_version_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
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
	"updated_by" text NOT NULL,
	CONSTRAINT "workout_sets_rpe_range" CHECK ("workout_sets"."rpe" IS NULL OR ("workout_sets"."rpe" BETWEEN 1 AND 10)),
	CONSTRAINT "workout_sets_rir_range" CHECK ("workout_sets"."rir" IS NULL OR ("workout_sets"."rir" BETWEEN 0 AND 10))
);
--> statement-breakpoint
CREATE TABLE "pain_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"workout_id" text NOT NULL,
	"exercise_id" text,
	"workout_set_id" text,
	"location" text NOT NULL,
	"severity" integer NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "pain_flags_severity_range" CHECK ("pain_flags"."severity" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "workout_tags" (
	"workout_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "workout_tags_workout_id_tag_id_pk" PRIMARY KEY("workout_id","tag_id")
);
--> statement-breakpoint

-- ── Columns added to existing tables ────────────────────────────

ALTER TABLE "workout_plans" ADD COLUMN "workout_plan_group_id" text;
--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "version_status" text DEFAULT 'draft' NOT NULL;
--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "version_number" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "published_at" timestamp with time zone;
--> statement-breakpoint

ALTER TABLE "exercises" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;
--> statement-breakpoint

ALTER TABLE "workouts" ADD COLUMN "pre_session_energy" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "pre_session_soreness" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "pre_session_stress" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "pre_session_note" text;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "post_session_energy" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "session_quality" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "session_quality_rated_by" text;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "session_quality_rated_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "trainee_rating" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "trainee_rating_rated_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "total_volume_lbs" real;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "total_work_seconds" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "total_rest_seconds" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "adherence_percent" real;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "average_rpe" real;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "pain_flag_count" integer;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "metadata" jsonb;
--> statement-breakpoint

-- ── Check constraints on workouts ───────────────────────────────

ALTER TABLE "workouts" DROP CONSTRAINT "workouts_energy_rating_range";
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_post_session_energy_range" CHECK ("workouts"."post_session_energy" IS NULL OR ("workouts"."post_session_energy" BETWEEN 1 AND 10));
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_energy_range" CHECK ("workouts"."pre_session_energy" IS NULL OR ("workouts"."pre_session_energy" BETWEEN 1 AND 10));
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_soreness_range" CHECK ("workouts"."pre_session_soreness" IS NULL OR ("workouts"."pre_session_soreness" BETWEEN 1 AND 10));
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pre_session_stress_range" CHECK ("workouts"."pre_session_stress" IS NULL OR ("workouts"."pre_session_stress" BETWEEN 1 AND 10));
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_session_quality_range" CHECK ("workouts"."session_quality" IS NULL OR ("workouts"."session_quality" BETWEEN 1 AND 10));
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainee_rating_range" CHECK ("workouts"."trainee_rating" IS NULL OR ("workouts"."trainee_rating" BETWEEN 1 AND 10));
--> statement-breakpoint

-- ── Foreign keys ─────────────────────────────────────────────────

ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_current_version_id_workout_plans_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_workout_plan_group_id_workout_plan_groups_id_fk" FOREIGN KEY ("workout_plan_group_id") REFERENCES "public"."workout_plan_groups"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_set_id_workout_sets_id_fk" FOREIGN KEY ("workout_set_id") REFERENCES "public"."workout_sets"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_session_quality_rated_by_users_id_fk" FOREIGN KEY ("session_quality_rated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX "workout_plan_groups_trainee_idx" ON "workout_plan_groups" USING btree ("trainee_id");
--> statement-breakpoint
CREATE INDEX "workout_plan_groups_current_version_idx" ON "workout_plan_groups" USING btree ("current_version_id");
--> statement-breakpoint
CREATE INDEX "workout_plans_group_idx" ON "workout_plans" USING btree ("workout_plan_group_id");
--> statement-breakpoint
CREATE INDEX "workout_sets_workout_exercise_idx" ON "workout_sets" USING btree ("workout_id","exercise_id","position");
--> statement-breakpoint
CREATE INDEX "workout_sets_workout_idx" ON "workout_sets" USING btree ("workout_id");
--> statement-breakpoint
CREATE INDEX "workout_sets_exercise_idx" ON "workout_sets" USING btree ("exercise_id");
--> statement-breakpoint
CREATE INDEX "workout_sets_video_idx" ON "workout_sets" USING btree ("video_id");
--> statement-breakpoint
CREATE INDEX "pain_flags_workout_idx" ON "pain_flags" USING btree ("workout_id");
--> statement-breakpoint
CREATE INDEX "pain_flags_exercise_idx" ON "pain_flags" USING btree ("exercise_id");
--> statement-breakpoint
CREATE INDEX "pain_flags_workout_set_idx" ON "pain_flags" USING btree ("workout_set_id");
--> statement-breakpoint
CREATE INDEX "workout_tags_tag_idx" ON "workout_tags" USING btree ("tag_id");
