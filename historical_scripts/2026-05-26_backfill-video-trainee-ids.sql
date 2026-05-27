-- Backfill trainee_id on videos that are linked to exercises but have no trainee_id set.
-- Safe to run multiple times (WHERE trainee_id IS NULL is idempotent).
-- Run against production after deploying the code change that stamps trainee_id at link time.

UPDATE videos
SET trainee_id = derived.trainee_id
FROM (
  SELECT DISTINCT ev.video_id, wp.trainee_id
  FROM exercise_videos ev
  JOIN exercises  ex ON ev.exercise_id = ex.id
  JOIN workout_plans wp ON ex.workout_plan_id = wp.id
) AS derived
WHERE videos.id          = derived.video_id
  AND videos.trainee_id IS NULL;
