ALTER TABLE "workout_plan_videos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "workout_plan_videos" CASCADE;--> statement-breakpoint
DROP INDEX "workout_plans_occurred_at_idx";--> statement-breakpoint
ALTER TABLE "workout_plans" DROP COLUMN "occurred_at";