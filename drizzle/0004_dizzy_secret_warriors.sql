ALTER TYPE "public"."video_status" ADD VALUE 'processing' BEFORE 'ready';--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "original_file_key" text;