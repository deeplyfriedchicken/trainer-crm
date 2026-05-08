-- Collapse multi-trainer chats into one chat per trainee.
-- For each trainee, keep the earliest-created chat as canonical, repoint
-- messages from duplicate chats, delete the duplicates, drop trainer_id,
-- and replace the (trainee_id, trainer_id) unique index with one on trainee_id.

WITH canonical AS (
  SELECT DISTINCT ON ("trainee_id") "id", "trainee_id"
  FROM "chats"
  ORDER BY "trainee_id", "created_at" ASC, "id" ASC
)
UPDATE "messages" AS m
SET "chat_id" = c."id"
FROM "chats" AS orig
JOIN canonical AS c ON c."trainee_id" = orig."trainee_id"
WHERE m."chat_id" = orig."id" AND orig."id" <> c."id";
--> statement-breakpoint
DELETE FROM "chats" AS dup
USING (
  SELECT DISTINCT ON ("trainee_id") "id", "trainee_id"
  FROM "chats"
  ORDER BY "trainee_id", "created_at" ASC, "id" ASC
) AS keep
WHERE dup."trainee_id" = keep."trainee_id" AND dup."id" <> keep."id";
--> statement-breakpoint
DROP INDEX IF EXISTS "chats_trainee_trainer_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "chats_trainer_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "chats_trainee_idx";--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT IF EXISTS "chats_trainer_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "trainer_id";--> statement-breakpoint
CREATE UNIQUE INDEX "chats_trainee_idx" ON "chats" USING btree ("trainee_id");
