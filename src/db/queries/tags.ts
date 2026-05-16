import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tags, videoTags, workoutTags } from "@/db/schema";

export async function listTags() {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function upsertTag(name: string) {
  const trimmed = name.trim().toLowerCase();
  await db
    .insert(tags)
    .values({ name: trimmed })
    .onConflictDoNothing({ target: tags.name });
  return db.query.tags.findFirst({ where: eq(tags.name, trimmed) });
}

export async function setVideoTags(videoId: string, tagIds: string[]) {
  await db.delete(videoTags).where(eq(videoTags.videoId, videoId));
  if (tagIds.length === 0) return;
  await db
    .insert(videoTags)
    .values(tagIds.map((tagId) => ({ videoId, tagId })));
}

export async function setWorkoutTags(
  workoutId: string,
  tagIds: string[],
  createdBy: string,
) {
  await db.delete(workoutTags).where(eq(workoutTags.workoutId, workoutId));
  if (tagIds.length === 0) return;
  await db
    .insert(workoutTags)
    .values(tagIds.map((tagId) => ({ workoutId, tagId, createdBy })));
}

export async function listWorkoutTags(workoutId: string) {
  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .innerJoin(workoutTags, eq(tags.id, workoutTags.tagId))
    .where(eq(workoutTags.workoutId, workoutId))
    .orderBy(asc(tags.name));
  return rows;
}
