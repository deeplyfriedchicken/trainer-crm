import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tags, videoTags } from "@/db/schema";

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
  await db.insert(videoTags).values(tagIds.map((tagId) => ({ videoId, tagId })));
}
