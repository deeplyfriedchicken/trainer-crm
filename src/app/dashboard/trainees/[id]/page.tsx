import { notFound } from "next/navigation";
import type { ColorVariant } from "@/app/components/SessionsPanel";
import { getOrCreateChat } from "@/db/queries/chats";
import { getTraineeById } from "@/db/queries/trainees";
import { getCurrentUser } from "@/lib/auth";
import { getPresignedGetUrl } from "@/lib/s3";
import { BackLink } from "./_components/BackLink";
import { ClientPortalLink } from "./_components/ClientPortalLink";
import { ProfileHero } from "./_components/ProfileHero";
import { ResetPinButton } from "./_components/ResetPinButton";
import { TraineeChatPanel } from "./_components/TraineeChatPanel";
import { TraineePlansPanel } from "./_components/TraineePlansPanel";
import { TraineeVideosPanel } from "./_components/TraineeVideosPanel";
import { TraineeWorkoutsPanel } from "./_components/TraineeWorkoutsPanel";
import "./page.css";

const VARIANT_CYCLE: ColorVariant[] = ["primary", "secondary", "tertiary"];
function colorVariantFor(name: string): ColorVariant {
  const idx = (name.toUpperCase().charCodeAt(0) - 65) % VARIANT_CYCLE.length;
  return VARIANT_CYCLE[Math.max(0, idx)] ?? "primary";
}

const VARIANT_HEX: Record<ColorVariant, string> = {
  primary: "#fd6dbb",
  secondary: "#34fdfe",
  tertiary: "#4ade80",
};

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

  const chat = await getOrCreateChat(trainee.id);

  const colorVariant = colorVariantFor(trainee.name);
  const accentColor = VARIANT_HEX[colorVariant];
  const memberSince = trainee.createdAt.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Collect unique direct videos for the videos panel
  const videoMap = new Map<
    string,
    { id: string; title: string; fileKey: string; durationSeconds?: number | null }
  >();
  for (const v of trainee.directVideos) {
    videoMap.set(v.id, v);
  }
  const clientVideos = await Promise.all(
    Array.from(videoMap.values()).map(async (v) => ({
      id: v.id,
      title: v.title,
      url: await getPresignedGetUrl(v.fileKey, 3600),
      durationSeconds: v.durationSeconds,
    })),
  );

  // Map workout plans to the shape TraineePlansPanel expects
  const plans = await Promise.all(
    trainee.workoutPlans.map(async (p) => ({
      id: p.id,
      name: p.name,
      comment: p.comment,
      createdAt: p.createdAt,
      versionStatus: p.versionStatus,
      publishedAt: p.publishedAt,
      workoutPlanGroupId: p.workoutPlanGroupId,
      exercises: await Promise.all(
        p.exercises.map(async (ex) => ({
          id: ex.id,
          name: ex.name,
          type: ex.type,
          sets: ex.sets,
          reps: ex.reps,
          durationSeconds: ex.durationSeconds,
          weightLbs: ex.weightLbs,
          comment: ex.comment,
          videos: await Promise.all(
            ex.videoLinks.map(async (vl) => ({
              id: vl.video.id,
              title: vl.video.title,
              url: await getPresignedGetUrl(vl.video.fileKey, 3600),
            })),
          ),
        })),
      ),
    })),
  );

  return (
    <div className="crm-page" style={{ paddingBottom: 60 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <BackLink href="/dashboard">Back to Dashboard</BackLink>
        <div style={{ display: "flex", gap: 8 }}>
          <ResetPinButton traineeId={trainee.id} />
          <ClientPortalLink traineeId={trainee.id} />
        </div>
      </div>

      <ProfileHero
        name={trainee.name}
        badge="Trainee"
        meta={trainee.email}
        accentColor={accentColor}
        statusColor="var(--color-tertiary)"
        stats={[
          {
            label: "Plans",
            value: String(trainee.workoutPlans.length),
            color: accentColor,
          },
          {
            label: "Workouts",
            value: String(trainee.workouts.length),
            color: accentColor,
          },
          { label: "Member since", value: memberSince },
        ]}
      />

      <div className="crm-split-panel">
        <TraineePlansPanel
          traineeId={trainee.id}
          plans={plans}
          colorVariant={colorVariant}
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

      {clientVideos.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <TraineeVideosPanel videos={clientVideos} accentColor={accentColor} />
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <TraineeWorkoutsPanel
          workouts={trainee.workouts}
          accentColor={accentColor}
          traineeId={trainee.id}
        />
      </div>
    </div>
  );
}
