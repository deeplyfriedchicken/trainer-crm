import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({
    video: { maxFileSize: "512MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      return { uploaderId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const [inserted] = await db
        .insert(videos)
        .values({
          uploaderId: metadata.uploaderId,
          title: file.name,
          fileKey: file.key,
          fileUrl: file.ufsUrl,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
          status: "ready",
        })
        .onConflictDoNothing({ target: videos.fileKey })
        .returning({ id: videos.id });

      return { videoId: inserted?.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
