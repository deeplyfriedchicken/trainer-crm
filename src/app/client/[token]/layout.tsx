import type { Metadata, Viewport } from "next";
import { getClientMetadata } from "@/db/queries/client";
import { decryptUserId } from "@/lib/client-token";
import { SwRegistration } from "./_components/SwRegistration";
import "./client.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const OG_IMAGE = "/og-image.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  const traineeId = decryptUserId(token);
  const clientMeta = traineeId ? await getClientMetadata(traineeId) : null;

  const title = clientMeta
    ? `${clientMeta.name} - TBDFit Workout Tracker`
    : "TBDFit Workout Tracker";
  const description = clientMeta?.mostRecentPlanName
    ? `Pick up where you left off with your latest ${clientMeta.mostRecentPlanName}`
    : "Personal training grounded in physical therapy, from recovery to peak performance";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1000, height: 1000, alt: "TBDFit" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [OG_IMAGE],
    },
    manifest: `/client/${token}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "My Trainer",
    },
    themeColor: "#fd6dbb",
  };
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SwRegistration />
      {children}
    </>
  );
}
