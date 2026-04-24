import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type VideoStatus, videos } from "@/db/schema";

export type ListVideosOptions = {
  limit: number;
  offset: number;
  uploaderId?: string;
  status?: VideoStatus;
};

export async function listVideos(options: ListVideosOptions) {
  const filters = [
    options.uploaderId ? eq(videos.uploaderId, options.uploaderId) : undefined,
    options.status ? eq(videos.status, options.status) : undefined,
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
      sessionLinks: {
        with: {
          session: {
            columns: { id: true, traineeId: true, occurredAt: true },
          },
        },
      },
      exerciseLinks: {
        with: {
          exercise: {
            columns: { id: true, sessionId: true, name: true },
          },
        },
      },
    },
  });
}
