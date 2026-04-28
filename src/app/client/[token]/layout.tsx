import type { Metadata } from "next";
import "./client.css";

export const metadata: Metadata = {
  title: "Training Portal",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
