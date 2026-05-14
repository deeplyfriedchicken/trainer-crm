import webPush from "web-push";

let initialized = false;

function init() {
  if (initialized) return;

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  initialized = true;
}

export type WebPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type NotificationPayload = {
  title: string;
  body: string;
};

export async function sendToSubscription(
  subscription: WebPushSubscription,
  payload: NotificationPayload,
) {
  init();

  await webPush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload),
  );
}
