-- Drop the old energy_rating column (data copied to post_session_energy in 0014).
ALTER TABLE "workouts" DROP COLUMN "energy_rating";
--> statement-breakpoint

-- Drop sets_data JSONB column (data unpacked to workout_sets in 0014).
ALTER TABLE "workout_exercises" DROP COLUMN "sets_data";
