// Dashboard is a live CRM — all routes must be rendered at request time, never pre-built.
export const dynamic = "force-dynamic";

import { Barlow_Condensed, Space_Grotesk, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { CurrentUserProvider } from "@/providers/CurrentUserProvider";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import "./crm.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-crm-display",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-neon-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-neon-mono",
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
