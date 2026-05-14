import admin from "firebase-admin";

let app: admin.app.App | undefined;

function getApp() {
  if (app) return app;

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  return app;
}

export type NotificationPayload = {
  title: string;
  body: string;
};

export async function sendToFcmTokens(
  tokens: string[],
  payload: NotificationPayload,
) {
  if (tokens.length === 0) return;

  const messaging = getApp().messaging();

  await messaging.sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.body },
  });
}
