"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
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

    // Lock body and every scrollable ancestor of the dialog panel so the
    // backdrop cannot be scrolled out of view in layouts that use an inner
    // scroll container (e.g. .crm-main with overflow-y: auto).
    const locked: { el: HTMLElement; prev: string }[] = [];
    let node: Element | null = panelRef.current?.parentElement ?? null;
    while (node && node !== document.documentElement) {
      if (node instanceof HTMLElement) {
        const oy = getComputedStyle(node).overflowY;
        if (oy === "auto" || oy === "scroll") {
          locked.push({ el: node, prev: node.style.overflowY });
          node.style.overflowY = "hidden";
        }
      }
      node = node.parentElement;
    }
    const prevBody = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevBody;
      for (const { el, prev } of locked) el.style.overflowY = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
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
    </div>
  );
}
