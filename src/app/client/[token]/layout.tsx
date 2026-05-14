import type { Metadata } from "next";
import { SwRegistration } from "./_components/SwRegistration";
import "./client.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Training Portal",
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
