import { Barlow_Condensed, Space_Grotesk, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./neon.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-neon-display",
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

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`neon ${barlowCondensed.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      {children}
    </div>
  );
}
