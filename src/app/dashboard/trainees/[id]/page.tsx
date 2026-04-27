import { notFound } from "next/navigation";
import { getOrCreateChat } from "@/db/queries/chats";
import { getTraineeById } from "@/db/queries/trainees";
import { getCurrentUser } from "@/lib/auth";
import { BackLink } from "./_components/BackLink";
import { ProfileHero } from "./_components/ProfileHero";
import { TraineeChatPanel } from "./_components/TraineeChatPanel";
import { TraineeSessionsPanel } from "./_components/TraineeSessionsPanel";
import "./page.css";

const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB",
  B: "#34FDFE",
  C: "#a78bfa",
  D: "#4ade80",
  E: "#fb923c",
  F: "#FD6DBB",
  G: "#34FDFE",
  H: "#a78bfa",
  I: "#4ade80",
  J: "#FD6DBB",
  K: "#34FDFE",
  L: "#a78bfa",
  M: "#4ade80",
  N: "#fb923c",
  O: "#FD6DBB",
  P: "#34FDFE",
  Q: "#a78bfa",
  R: "#4ade80",
  S: "#FD6DBB",
  T: "#34FDFE",
  U: "#a78bfa",
  V: "#4ade80",
  W: "#fb923c",
  X: "#FD6DBB",
  Y: "#34FDFE",
  Z: "#a78bfa",
};
function colorFor(name: string) {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

export default async function TraineePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [currentUser, trainee] = await Promise.all([
    getCurrentUser(),
    getTraineeById(id),
  ]);

  if (!trainee) notFound();

  const chat = await getOrCreateChat(trainee.id, currentUser.id);

  const accentColor = colorFor(trainee.name);
  const trainerName = trainee.activeTrainer?.trainer.name ?? "Unassigned";
  const memberSince = trainee.createdAt.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const sessions = trainee.coachingSessions.map((s) => ({
    id: s.id,
    occurredAt: s.occurredAt,
    energyRating: s.energyRating,
    painRating: s.painRating,
    comment: s.comment,
    exercises: s.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      comment: ex.comment,
      videos: ex.videoLinks.map((vl) => ({
        id: vl.video.id,
        title: vl.video.title,
        url: vl.video.fileUrl,
      })),
    })),
  }));

  return (
    <div className="crm-page" style={{ paddingBottom: 60 }}>
      <BackLink href="/dashboard">Back to Dashboard</BackLink>

      <ProfileHero
        name={trainee.name}
        badge="Trainee"
        meta={`${trainee.email}${trainee.activeTrainer ? ` · Trainer: ${trainerName}` : ""}`}
        accentColor={accentColor}
        statusColor="#4ade80"
        stats={[
          {
            label: "Sessions",
            value: String(trainee.coachingSessions.length),
            color: accentColor,
          },
          { label: "Trainer", value: trainerName },
          { label: "Member since", value: memberSince },
        ]}
      />

      <div className="crm-split-panel">
        <TraineeSessionsPanel
          traineeId={trainee.id}
          sessions={sessions}
          accentColor={accentColor}
        />
        <TraineeChatPanel
          chatId={chat.id}
          initialMessages={chat.messages}
          currentUserId={currentUser.id}
          participant={{
            id: trainee.id,
            name: trainee.name,
            email: trainee.email,
          }}
        />
      </div>
    </div>
  );
}
