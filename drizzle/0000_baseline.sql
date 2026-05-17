CREATE TYPE "public"."exercise_type" AS ENUM('reps', 'duration');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'trainer_manager', 'trainer', 'trainee');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('uploading', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"trainee_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_videos" (
	"exercise_id" text NOT NULL,
	"video_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "exercise_videos_exercise_id_video_id_pk" PRIMARY KEY("exercise_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"workout_plan_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "exercise_type" DEFAULT 'reps' NOT NULL,
	"sets" integer NOT NULL,
	"reps" integer,
	"duration_seconds" integer,
	"weight_lbs" real,
	"position" integer NOT NULL,
	"comment" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "exercises_type_fields_check" CHECK (("exercises"."type" = 'reps' AND "exercises"."reps" IS NOT NULL) OR ("exercises"."type" = 'duration' AND "exercises"."duration_seconds" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role" "user_role" NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"pin" text,
	"pin_updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_tags" (
	"video_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_tags_video_id_tag_id_pk" PRIMARY KEY("video_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"uploader_id" text NOT NULL,
	"trainee_id" text,
	"title" text NOT NULL,
	"description" text,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"mime_type" text NOT NULL,
	"duration_seconds" integer,
	"original_width" integer,
	"original_height" integer,
	"status" "video_status" DEFAULT 'uploading' NOT NULL,
	"original_file_key" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"workout_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "workout_exercises_workout_id_exercise_id_pk" PRIMARY KEY("workout_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "workout_plan_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"trainee_id" text NOT NULL,
	"name" text NOT NULL,
	"current_version_id" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plan_videos" (
	"workout_plan_id" text NOT NULL,
	"video_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "workout_plan_videos_workout_plan_id_video_id_pk" PRIMARY KEY("workout_plan_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"trainee_id" text NOT NULL,
	"workout_plan_group_id" text,
	"name" text DEFAULT '' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"comment" text,
	"version_status" text DEFAULT 'draft' NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
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
CREATE TABLE "workout_tags" (
	"workout_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "workout_tags_workout_id_tag_id_pk" PRIMARY KEY("workout_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "workout_videos" (
	"workout_id" text NOT NULL,
	"video_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "workout_videos_workout_id_video_id_pk" PRIMARY KEY("workout_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" text PRIMARY KEY NOT NULL,
	"trainee_id" text NOT NULL,
	"workout_plan_id" text,
	"duration_seconds" integer NOT NULL,
	"pain_rating" integer,
	"pre_session_energy" integer,
	"pre_session_soreness" integer,
	"pre_session_stress" integer,
	"pre_session_note" text,
	"post_session_energy" integer,
	"session_quality" integer,
	"session_quality_rated_by" text,
	"session_quality_rated_at" timestamp with time zone,
	"trainee_rating" integer,
	"trainee_rating_rated_at" timestamp with time zone,
	"total_volume_lbs" real,
	"total_work_seconds" integer,
	"total_rest_seconds" integer,
	"adherence_percent" real,
	"average_rpe" real,
	"pain_flag_count" integer,
	"comment" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "workouts_pain_rating_range" CHECK ("workouts"."pain_rating" IS NULL OR ("workouts"."pain_rating" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_post_session_energy_range" CHECK ("workouts"."post_session_energy" IS NULL OR ("workouts"."post_session_energy" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_pre_session_energy_range" CHECK ("workouts"."pre_session_energy" IS NULL OR ("workouts"."pre_session_energy" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_pre_session_soreness_range" CHECK ("workouts"."pre_session_soreness" IS NULL OR ("workouts"."pre_session_soreness" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_pre_session_stress_range" CHECK ("workouts"."pre_session_stress" IS NULL OR ("workouts"."pre_session_stress" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_session_quality_range" CHECK ("workouts"."session_quality" IS NULL OR ("workouts"."session_quality" BETWEEN 1 AND 10)),
	CONSTRAINT "workouts_trainee_rating_range" CHECK ("workouts"."trainee_rating" IS NULL OR ("workouts"."trainee_rating" BETWEEN 1 AND 10))
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_videos" ADD CONSTRAINT "exercise_videos_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_videos" ADD CONSTRAINT "exercise_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_videos" ADD CONSTRAINT "exercise_videos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_videos" ADD CONSTRAINT "exercise_videos_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_workout_set_id_workout_sets_id_fk" FOREIGN KEY ("workout_set_id") REFERENCES "public"."workout_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pain_flags" ADD CONSTRAINT "pain_flags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_current_version_id_workout_plans_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_groups" ADD CONSTRAINT "workout_plan_groups_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_videos" ADD CONSTRAINT "workout_plan_videos_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_videos" ADD CONSTRAINT "workout_plan_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_videos" ADD CONSTRAINT "workout_plan_videos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_videos" ADD CONSTRAINT "workout_plan_videos_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_workout_plan_group_id_workout_plan_groups_id_fk" FOREIGN KEY ("workout_plan_group_id") REFERENCES "public"."workout_plan_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_tags" ADD CONSTRAINT "workout_tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_videos" ADD CONSTRAINT "workout_videos_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_videos" ADD CONSTRAINT "workout_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_videos" ADD CONSTRAINT "workout_videos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_videos" ADD CONSTRAINT "workout_videos_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainee_id_users_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_session_quality_rated_by_users_id_fk" FOREIGN KEY ("session_quality_rated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chats_trainee_idx" ON "chats" USING btree ("trainee_id");--> statement-breakpoint
CREATE INDEX "exercise_videos_video_idx" ON "exercise_videos" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "exercise_videos_created_by_idx" ON "exercise_videos" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "exercises_plan_idx" ON "exercises" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE INDEX "exercises_plan_position_idx" ON "exercises" USING btree ("workout_plan_id","position");--> statement-breakpoint
CREATE INDEX "exercises_created_by_idx" ON "exercises" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "messages_chat_idx" ON "messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "pain_flags_workout_idx" ON "pain_flags" USING btree ("workout_id");--> statement-breakpoint
CREATE INDEX "pain_flags_exercise_idx" ON "pain_flags" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "pain_flags_workout_set_idx" ON "pain_flags" USING btree ("workout_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_tokens_token_idx" ON "push_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "video_tags_tag_idx" ON "video_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "videos_uploader_idx" ON "videos" USING btree ("uploader_id");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_file_key_idx" ON "videos" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "workout_exercises_exercise_idx" ON "workout_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_exercises_created_by_idx" ON "workout_exercises" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "workout_plan_groups_trainee_idx" ON "workout_plan_groups" USING btree ("trainee_id");--> statement-breakpoint
CREATE INDEX "workout_plan_groups_current_version_idx" ON "workout_plan_groups" USING btree ("current_version_id");--> statement-breakpoint
CREATE INDEX "workout_plan_videos_video_idx" ON "workout_plan_videos" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "workout_plan_videos_created_by_idx" ON "workout_plan_videos" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "workout_plans_trainee_idx" ON "workout_plans" USING btree ("trainee_id");--> statement-breakpoint
CREATE INDEX "workout_plans_group_idx" ON "workout_plans" USING btree ("workout_plan_group_id");--> statement-breakpoint
CREATE INDEX "workout_plans_occurred_at_idx" ON "workout_plans" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "workout_plans_created_by_idx" ON "workout_plans" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "workout_sets_workout_exercise_idx" ON "workout_sets" USING btree ("workout_id","exercise_id","position");--> statement-breakpoint
CREATE INDEX "workout_sets_workout_idx" ON "workout_sets" USING btree ("workout_id");--> statement-breakpoint
CREATE INDEX "workout_sets_exercise_idx" ON "workout_sets" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_sets_video_idx" ON "workout_sets" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "workout_tags_tag_idx" ON "workout_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "workout_videos_video_idx" ON "workout_videos" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "workout_videos_created_by_idx" ON "workout_videos" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "workouts_trainee_idx" ON "workouts" USING btree ("trainee_id");--> statement-breakpoint
CREATE INDEX "workouts_plan_idx" ON "workouts" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE INDEX "workouts_created_at_idx" ON "workouts" USING btree ("created_at");