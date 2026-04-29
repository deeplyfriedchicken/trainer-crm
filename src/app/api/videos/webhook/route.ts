import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest } from "next/server";
import MessageValidator from "sns-validator";
import { getVideoById, updateVideo } from "@/db/queries/videos";
import { s3, S3_BUCKET } from "@/lib/s3";

const validator = new MessageValidator();

function validateMessage(body: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    validator.validate(body, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 200 });
  }

  // Verify SNS signature
  try {
    await validateMessage(body);
  } catch {
    return new Response(null, { status: 200 });
  }

  // Guard: only accept messages from our topic
  if (body.TopicArn !== process.env.MEDIACONVERT_SNS_TOPIC_ARN) {
    return new Response(null, { status: 200 });
  }

  // Auto-confirm subscription
  if (body.Type === "SubscriptionConfirmation") {
    const url = body.SubscribeURL as string;
    await fetch(url);
    return new Response(null, { status: 200 });
  }

  if (body.Type !== "Notification") {
    return new Response(null, { status: 200 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body.Message as string);
  } catch {
    return new Response(null, { status: 200 });
  }

  const detail = event.detail as Record<string, unknown> | undefined;
  const userMetadata = detail?.userMetadata as
    | Record<string, string>
    | undefined;
  const videoId = userMetadata?.videoId;
  const status = detail?.status as string | undefined;

  if (!videoId || !status) {
    return new Response(null, { status: 200 });
  }

  const video = await getVideoById(videoId);
  if (!video || video.status !== "processing") {
    return new Response(null, { status: 200 });
  }

  if (status === "COMPLETE") {
    const outputDetails = (
      (detail?.outputGroupDetails as Array<Record<string, unknown>>)?.[0]
        ?.outputDetails as Array<Record<string, unknown>>
    )?.[0];
    const durationMs = outputDetails?.durationInMs as number | undefined;

    await updateVideo(videoId, {
      status: "ready",
      ...(durationMs != null && {
        durationSeconds: Math.round(durationMs / 1000),
      }),
    });

    if (video.originalFileKey) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: video.originalFileKey }),
      );
    }
  } else if (status === "ERROR" || status === "CANCELED") {
    await updateVideo(videoId, { status: "failed" });
  }

  return new Response(null, { status: 200 });
}
