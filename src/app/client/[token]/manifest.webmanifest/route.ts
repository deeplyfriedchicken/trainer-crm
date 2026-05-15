import { getClientMetadata } from "@/db/queries/client";
import { decryptUserId } from "@/lib/client-token";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const traineeId = decryptUserId(token);
  const clientMeta = traineeId ? await getClientMetadata(traineeId) : null;

  const fullName = clientMeta?.name ?? null;
  const firstName = fullName?.split(" ")[0] ?? null;

  const name = fullName
    ? `TBDFit Exercise Tracker - ${fullName}`
    : "TBDFit Exercise Tracker";
  const short_name = firstName ? `TBDFit - ${firstName}` : "TBDFit";

  return Response.json(
    {
      name,
      short_name,
      description:
        "Continue where you left off after your session, and track your workouts, ask questions, and see your progress here.",
      start_url: `/client/${token}`,
      scope: "/client/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#fd6dbb",
      background_color: "#070712",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: { "Content-Type": "application/manifest+json" },
    },
  );
}
