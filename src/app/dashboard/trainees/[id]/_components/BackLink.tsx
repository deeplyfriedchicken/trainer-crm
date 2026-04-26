import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft } from "react-icons/lu";
import styles from "./BackLink.module.css";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.link}>
      <LuArrowLeft size={16} />
      {children}
    </Link>
  );
}
