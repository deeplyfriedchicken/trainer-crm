# Remove workout_plan_videos join table

The `workout_plan_videos` table was built to support attaching videos to a plan as a whole, but this attachment point was never wired into any feature or UI. Videos are attached at the exercise level (trainer demos) or at the workout level (trainee form-checks); plan-level video has no defined purpose. We decided to drop the table rather than leave dead schema that implies a feature contract that doesn't exist.
