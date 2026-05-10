ALTER TABLE "exercises" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "deleted_at" timestamp with time zone;