// Dashboard is a live CRM — all routes must be rendered at request time, never pre-built.
export const dynamic = "force-dynamic";

import { Barlow_Condensed, Space_Grotesk, Space_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { CurrentUserProvider } from "@/providers/CurrentUserProvider";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import "./crm.css";

const OG_IMAGE = "https://tbd.fit/wp-content/uploads/2025/03/tbd-logo-1000.png";
const DESCRIPTION =
  "Personal training grounded in physical therapy, from recovery to peak performance";

export const metadata: Metadata = {
  title: "TBDFit Trainer Portal",
  description: DESCRIPTION,
  openGraph: {
    title: "TBDFit Trainer Portal",
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1000, height: 1000, alt: "TBDFit" }],
  },
  twitter: {
    card: "summary",
    title: "TBDFit Trainer Portal",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-crm-display",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div
      className={`crm ${barlow.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <Sidebar user={user} />
      <main className="crm-main">
        <Topbar />
        <CurrentUserProvider user={user}>{children}</CurrentUserProvider>
      </main>
    </div>
  );
}
