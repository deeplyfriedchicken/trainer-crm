import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { tags, type VideoStatus, videos, videoTags } from "@/db/schema";

export type VideoRow = Awaited<ReturnType<typeof listVideos>>[number];

export type UpdateVideoInput = {
  title?: string;
  description?: string | null;
  status?: "uploading" | "processing" | "ready" | "failed";
  originalFileKey?: string | null;
  fileKey?: string;
  fileUrl?: string;
  durationSeconds?: number | null;
  mimeType?: string;
  fileSizeBytes?: number;
};

export async function updateVideo(id: string, input: UpdateVideoInput) {
  const [updated] = await db
    .update(videos)
    .set(input)
    .where(eq(videos.id, id))
    .returning();
  return updated;
}

export type ListVideosOptions = {
  limit: number;
  offset: number;
  uploaderId?: string;
  status?: VideoStatus;
  /** Matches video title OR any associated tag name (case-insensitive). */
  search?: string;
};

export async function listVideos(options: ListVideosOptions) {
  const tagMatchSubquery = options.search
    ? db
        .select({ videoId: videoTags.videoId })
        .from(videoTags)
        .innerJoin(tags, eq(tags.id, videoTags.tagId))
        .where(ilike(tags.name, `%${options.search}%`))
    : null;

  const filters = [
    options.uploaderId ? eq(videos.uploaderId, options.uploaderId) : undefined,
    options.status ? eq(videos.status, options.status) : undefined,
    options.search
      ? or(
          ilike(videos.title, `%${options.search}%`),
          inArray(videos.id, tagMatchSubquery!),
        )
      : undefined,
  ].filter((f): f is NonNullable<typeof f> => f !== undefined);

  return db.query.videos.findMany({
    where: filters.length ? and(...filters) : undefined,
    with: {
      uploader: { columns: { id: true, name: true, email: true } },
      videoTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
    orderBy: [desc(videos.createdAt)],
    limit: options.limit,
    offset: options.offset,
  });
}

export async function getVideoById(id: string) {
  return db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: {
      uploader: { columns: { id: true, name: true, email: true } },
      workoutPlanLinks: {
        with: {
          workoutPlan: {
            columns: { id: true, traineeId: true, occurredAt: true },
          },
        },
      },
      exerciseLinks: {
        with: {
          exercise: {
            columns: { id: true, workoutPlanId: true, name: true },
          },
        },
      },
    },
  });
}
