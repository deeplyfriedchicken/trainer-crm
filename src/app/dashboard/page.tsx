import "./page.css";
import { Flex } from "@chakra-ui/react";
import { listTrainees } from "@/db/queries/trainees";
import { listTrainers } from "@/db/queries/trainers";
import { listVideos } from "@/db/queries/videos";
import { TraineeTable } from "./_components/TraineeTable";
import { VideoGallery } from "./_components/VideoGallery";

export default async function DashboardHome() {
  const [trainees, trainers, videos] = await Promise.all([
    listTrainees({ limit: 100, offset: 0 }),
    listTrainers({ limit: 100, offset: 0 }),
    listVideos({ limit: 12, offset: 0, status: "ready" }),
  ]);

  console.log({ videos });

  const totalSessions = trainees.reduce((sum, t) => sum + t.sessionCount, 0);

  const stats = [
    {
      num: trainees.length,
      label: "Total Trainees",
      change: "↑ enrolled",
      accent: "",
    },
    {
      num: videos.length,
      label: "Videos Uploaded",
      change: "↑ by your team",
      accent: "cyan",
    },
    {
      num: totalSessions,
      label: "Total Sessions",
      change: "↑ across all trainees",
      accent: "green",
    },
    {
      num: trainers.length,
      label: "Team Trainers",
      change: "↑ active coaches",
      accent: "orange",
    },
  ] as const;

  return (
    <div className="crm-page">
      <div className="crm-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`crm-stat-card ${s.accent}`}>
            <div className={`crm-stat-num ${s.accent}`}>{s.num}</div>
            <div className="crm-stat-lbl">{s.label}</div>
            <div className="crm-stat-change up">{s.change}</div>
          </div>
        ))}
      </div>

      <Flex direction="column" gap="28px">
        <TraineeTable trainees={trainees} />
        <VideoGallery videos={videos} />
      </Flex>
    </div>
  );
}
