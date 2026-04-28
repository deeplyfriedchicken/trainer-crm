import { notFound, redirect } from "next/navigation";
import { getPlanForLog } from "@/db/queries/client";
import { getClientSession } from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";
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

  const plan = await getPlanForLog(planId, traineeId);
  if (!plan) notFound();

  return <LogWorkoutClient token={token} plan={plan} />;
}
