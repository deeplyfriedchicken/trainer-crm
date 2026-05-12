import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { getApiUser } from "@/lib/api-auth";
import { S3_BASE_URL, S3_BUCKET, s3 } from "@/lib/s3";

// @body { fileName: string; mimeType: string; fileSizeBytes: number; traineeId?: string }
// @invokes db.insert(videos), getSignedUrl(PutObjectCommand)
// @errors 400 only video/* mimeType allowed | 401 unauthorized
export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    fileName,
    mimeType,
    fileSizeBytes,
    traineeId,
    width,
    height,
    duration,
  } = body as {
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    traineeId?: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  if (!mimeType?.startsWith("video/")) {
    return Response.json(
      { error: "Only video files are allowed" },
      { status: 400 },
    );
  }

  const videoId = createId();
  const key = `videos/${videoId}`;
  const fileUrl = `${S3_BASE_URL}/${key}`;

  await db.insert(videos).values({
    id: videoId,
    uploaderId: user.id,
    ...(traineeId && { traineeId }),
    title: fileName,
    fileKey: key,
    fileUrl,
    fileName,
    fileSizeBytes,
    mimeType,
    status: "uploading",
    ...(width != null &&
      height != null && { originalWidth: width, originalHeight: height }),
    ...(duration != null && { durationSeconds: Math.round(duration) }),
  });

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: 900 },
  );

  return Response.json({ videoId, uploadUrl });
}
