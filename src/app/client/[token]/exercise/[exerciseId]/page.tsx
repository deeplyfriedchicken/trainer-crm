import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LuChevronLeft, LuDumbbell } from "react-icons/lu";
import { getExerciseForClient } from "@/db/queries/client";
import { StatPill } from "@/app/components/StatPill";
import { getClientSession } from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";
import { getPresignedGetUrl } from "@/lib/s3";
import { VideoCarousel } from "./_components/VideoCarousel";

export default async function ExerciseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; exerciseId: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const { token, exerciseId } = await params;
  const { back } = await searchParams;
  const backHref = back ? `/client/${token}?${back}` : `/client/${token}`;

  const traineeId = decryptUserId(token);
  if (!traineeId) notFound();

  const session = await getClientSession();
  if (session?.traineeId !== traineeId) {
    redirect(`/client/${token}`);
  }

  const raw = await getExerciseForClient(exerciseId, traineeId);
  if (!raw) notFound();

  const exercise = {
    ...raw,
    videoLinks: await Promise.all(
      raw.videoLinks.map(async (vl) => ({
        ...vl,
        video: {
          ...vl.video,
          fileUrl: await getPresignedGetUrl(vl.video.fileKey, 86400),
        },
      })),
    ),
  };

  const weightLabel = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <LuDumbbell size={10} />
      Weight
    </span>
  );

  return (
    <div className="client-page">
      <div className="client-topbar">
        <div className="client-topbar-inner">
          <Link href={backHref} className="client-back-btn">
            <LuChevronLeft size={18} /> Back
          </Link>
        </div>
      </div>

      <div className="client-inner">
        <div className="ex-detail-header">
          <h1 className="ex-detail-title">{exercise.name}</h1>
        </div>

        <div className="sets-grid">
          <StatPill label="Sets" value={exercise.sets} />
          <StatPill
            label={exercise.type === "duration" ? "Duration" : "Reps"}
            value={exercise.type === "duration" ? exercise.durationSeconds ?? 0 : (exercise.reps ?? 0)}
            unit={exercise.type === "duration" ? "sec / set" : "per set"}
          />
          <StatPill
            label={weightLabel}
            value={exercise.weightLbs ?? 0}
            unit="lbs"
          />
        </div>

        {exercise.comment && (
          <div className="ex-description">
            <div className="ex-description-label">Coach Notes</div>
            {exercise.comment}
          </div>
        )}

        {exercise.videoLinks.length > 0 && (
          <VideoCarousel
            videos={exercise.videoLinks.map(({ video }) => ({
              id: video.id,
              title: video.title,
              fileUrl: video.fileUrl,
            }))}
          />
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
