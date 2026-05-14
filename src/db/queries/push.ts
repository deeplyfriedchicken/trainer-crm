import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, pushTokens } from "@/db/schema";

export async function upsertPushToken(
  userId: string,
  token: string,
  platform: "ios" | "android",
) {
  await db
    .insert(pushTokens)
    .values({ userId, token, platform })
    .onConflictDoUpdate({
      target: pushTokens.token,
      set: { userId, platform, updatedAt: new Date() },
    });
}

export async function deletePushToken(token: string) {
  await db.delete(pushTokens).where(eq(pushTokens.token, token));
}

export async function getPushTokensForUser(userId: string) {
  return db.query.pushTokens.findMany({
    where: eq(pushTokens.userId, userId),
  });
}

export async function upsertPushSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
) {
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint, p256dh, auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh, auth, updatedAt: new Date() },
    });
}

export async function deletePushSubscription(endpoint: string) {
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function getPushSubscriptionsForUser(userId: string) {
  return db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });
}
