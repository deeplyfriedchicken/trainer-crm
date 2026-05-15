"use client";

import { registerPushSubscription } from "../actions";
import styles from "./PushPermissionPrompt.module.css";

const STORAGE_KEY = "push-prompted";

type Props = {
  onDismiss: () => void;
};

export function PushPermissionPrompt({ onDismiss }: Props) {
  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
        const json = sub.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };
        await registerPushSubscription(
          json.endpoint,
          json.keys.p256dh,
          json.keys.auth,
        );
      }
    } catch {
      // Silently ignore — notifications are opt-in
    } finally {
      localStorage.setItem(STORAGE_KEY, "1");
      onDismiss();
    }
  }

  function handleDeny() {
    localStorage.setItem(STORAGE_KEY, "1");
    onDismiss();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.icon}>🔔</div>
        <p className={styles.title}>Stay in the loop</p>
        <p className={styles.body}>
          Get notified when your trainer sends a message, even when the app is
          closed.
        </p>
        <button type="button" className={styles.allow} onClick={handleAllow}>
          Allow notifications
        </button>
        <button type="button" className={styles.deny} onClick={handleDeny}>
          Not now
        </button>
      </div>
    </div>
  );
}

export function shouldShowPrompt() {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return false;
  if (Notification.permission === "denied") return false;
  return !localStorage.getItem(STORAGE_KEY);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
