"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./BottomSheet.module.css";

export interface BottomSheetProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  titleAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  zIndex?: number;
}

export function BottomSheet({
  onClose,
  title,
  subtitle,
  titleAction,
  footer,
  children,
  zIndex,
}: BottomSheetProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
      >
        <div className={styles.handle} />

        {(title || titleAction) && (
          <div className={styles.header}>
            <div className={styles.headerRow}>
              <div>
                {title && (
                  <div id="bottom-sheet-title" className={styles.title}>
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className={styles.subtitle}>{subtitle}</div>
                )}
              </div>
              {titleAction}
            </div>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
