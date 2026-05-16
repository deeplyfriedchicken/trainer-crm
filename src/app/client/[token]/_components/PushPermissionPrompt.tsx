"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { registerPushSubscription } from "../actions";

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
    <BottomSheet
      onClose={handleDeny}
      title="Stay in the loop"
      footer={
        <>
          <Button variant="solid" colorScheme="pink" w="100%" mb={3} onClick={handleAllow}>
            Allow notifications
          </Button>
          <Button variant="ghost" colorScheme="neutral" w="100%" onClick={handleDeny}>
            Not now
          </Button>
        </>
      }
    >
      <Text
        as="p"
        textAlign="center"
        fontSize="2rem"
        mb={3}
        mt={2}
      >
        🔔
      </Text>
      <Text
        as="p"
        variant="body-sm"
        color="var(--color-text-muted)"
        textAlign="center"
        lineHeight="1.6"
        mb={4}
        px={2}
      >
        Get notified when your trainer sends a message, even when the app is
        closed.
      </Text>
    </BottomSheet>
  );
}

export function isPwa() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in navigator && navigator.standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function shouldShowPrompt() {
  if (typeof window === "undefined") return false;
  if (!isPwa()) return false;
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
