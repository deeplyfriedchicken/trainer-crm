"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

/** Scrollable content area for use inside Dialog when you don't need custom layout. */
export function DialogBody({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={styles.body} style={style}>
      {children}
    </div>
  );
}

export function Dialog({
  isOpen,
  onClose,
  title,
  maxWidth = 740,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: number;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock all scrollable containers in the page so the backdrop stays put.
    // The dialog renders into a portal (document.body), so we can't walk up
    // from panelRef — instead query every scrollable element directly.
    const locked: { el: HTMLElement; prev: string }[] = [];
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) {
        locked.push({ el, prev: el.style.overflowY });
        el.style.overflowY = "hidden";
      }
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      for (const { el, prev } of locked) el.style.overflowY = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={panelRef}
        className={styles.panel}
        style={{ "--dialog-max-width": `${maxWidth}px` } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
      >
        {title && (
          <div className={styles.header}>
            <div id="dialog-title" className={styles.title}>{title}</div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
