import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_IMAGE = "https://tbd.fit/wp-content/uploads/2025/03/tbd-logo-1000.png";

export const metadata: Metadata = {
  title: "TBDFit",
  description:
    "Personal training grounded in physical therapy, from recovery to peak performance",
  openGraph: {
    title: "TBDFit",
    description:
      "Personal training grounded in physical therapy, from recovery to peak performance",
    images: [{ url: OG_IMAGE, width: 1000, height: 1000, alt: "TBDFit" }],
  },
  twitter: {
    card: "summary",
    title: "TBDFit",
    description:
      "Personal training grounded in physical therapy, from recovery to peak performance",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
