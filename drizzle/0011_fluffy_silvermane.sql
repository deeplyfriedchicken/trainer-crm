ALTER TABLE "exercises" ADD COLUMN "position" integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE "exercises" AS e SET "position" = sub.rn - 1
FROM (
  SELECT "id",
         ROW_NUMBER() OVER (
           PARTITION BY "workout_plan_id"
           ORDER BY "created_at" ASC, "id" ASC
         ) AS rn
  FROM "exercises"
) AS sub
WHERE e."id" = sub."id";--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "position" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "exercises_plan_position_idx" ON "exercises" USING btree ("workout_plan_id","position");
