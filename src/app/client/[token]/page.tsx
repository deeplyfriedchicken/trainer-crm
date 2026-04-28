import { notFound } from "next/navigation";
import { getClientData } from "@/db/queries/client";
import { getClientSession } from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";
import { PinModal } from "./_components/PinModal";
import { WorkoutPlansView } from "./_components/WorkoutPlansView";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const traineeId = decryptUserId(token);
  if (!traineeId) notFound();

  const [session, clientData] = await Promise.all([
    getClientSession(),
    getClientData(traineeId),
  ]);

  if (!clientData) notFound();

  const isAuthenticated = session?.traineeId === traineeId;

  if (!isAuthenticated) {
    return <PinModal token={token} hasPin={clientData.hasPin} />;
  }

  return (
    <WorkoutPlansView
      trainee={{ name: clientData.name, email: clientData.email }}
      sessions={clientData.coachingSessions}
      token={token}
    />
  );
}
