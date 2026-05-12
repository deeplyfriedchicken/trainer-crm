import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LuChevronLeft, LuVideo } from "react-icons/lu";
import { getExerciseForClient } from "@/db/queries/client";
import { Badge } from "@/app/components/Badge";
import { StatPill } from "@/app/components/StatPill";
import { getClientSession } from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";
import { getPresignedGetUrl } from "@/lib/s3";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ token: string; exerciseId: string }>;
}) {
  const { token, exerciseId } = await params;

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

  const volume = exercise.sets * exercise.reps;

  return (
    <div className="client-page">
      <div className="client-topbar">
        <div className="client-topbar-inner">
          <Link href={`/client/${token}`} className="client-back-btn">
            <LuChevronLeft size={18} /> Back
          </Link>
        </div>
      </div>

      <div className="client-inner">
        <div className="ex-detail-header">
          <div className="ex-detail-badges">
            {exercise.videoLinks.length > 0 && (
              <Badge colorScheme="pink" variant="subtle">
                <LuVideo size={10} /> Video
              </Badge>
            )}
          </div>
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
            label="Volume"
            value={volume}
            unit="total reps"
          />
        </div>

        {exercise.comment && (
          <div className="ex-description">
            <div className="ex-description-label">Coach Notes</div>
            {exercise.comment}
          </div>
        )}

        {exercise.videoLinks.map(({ video }) => (
          <div key={video.id}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "20px 0 10px",
              }}
            >
              {video.title}
            </div>
            <div className="video-wrap">
              <video
                src={video.fileUrl}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        ))}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
