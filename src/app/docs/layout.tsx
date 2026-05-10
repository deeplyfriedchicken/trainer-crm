import { Barlow_Condensed, Space_Grotesk, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "../components/neon.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
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

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`showcase ${barlowCondensed.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      {children}
    </div>
  );
}
