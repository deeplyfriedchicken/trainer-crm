import { notFound, redirect } from "next/navigation";
import { getPlanForLog } from "@/db/queries/client";
import { getClientSession } from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";
import { getPresignedGetUrl } from "@/lib/s3";
import { LogWorkoutClient } from "./_components/LogWorkoutClient";

export default async function LogWorkoutPage({
  params,
}: {
  params: Promise<{ token: string; sessionId: string }>;
}) {
  const { token, sessionId: planId } = await params;

  const traineeId = decryptUserId(token);
  if (!traineeId) notFound();

  const session = await getClientSession();
  if (session?.traineeId !== traineeId) redirect(`/client/${token}`);

  const raw = await getPlanForLog(planId, traineeId);
  if (!raw) notFound();

  const plan = {
    ...raw,
    exercises: await Promise.all(
      raw.exercises.map(async (ex) => ({
        ...ex,
        videoLinks: await Promise.all(
          ex.videoLinks.map(async (vl) => ({
            ...vl,
            video: {
              ...vl.video,
              fileUrl: await getPresignedGetUrl(vl.video.fileKey, 86400),
            },
          })),
        ),
      })),
    ),
  };

  return <LogWorkoutClient token={token} plan={plan} />;
}
