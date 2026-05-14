import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { chats, pushSubscriptions, pushTokens, userRoles } from "@/db/schema";
import { sendToFcmTokens } from "./fcm";
import { sendToSubscription } from "./web-push";

export async function notifyRecipients(
  chatId: string,
  senderId: string,
  senderName: string,
  messageText: string,
) {
  try {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });
    if (!chat) return;

    const payload = {
      title: senderName,
      body: messageText.slice(0, 80),
    };

    const senderIsTrainee = chat.traineeId === senderId;

    if (senderIsTrainee) {
      const trainerRoles = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(
          sql`${userRoles.role} IN ('trainer', 'trainer_manager', 'admin')`,
        );

      const trainerIds = trainerRoles.map((r) => r.userId);
      console.log("[notify] trainee→trainers, trainerIds:", trainerIds);
      if (trainerIds.length === 0) return;

      const tokens = await db.query.pushTokens.findMany({
        where: inArray(pushTokens.userId, trainerIds),
      });
      console.log("[notify] FCM tokens found:", tokens.length);

      if (tokens.length > 0) {
        await sendToFcmTokens(tokens.map((t) => t.token), payload);
        console.log("[notify] FCM sent");
      }
    } else {
      const subs = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, chat.traineeId),
      });
      console.log("[notify] trainer→trainee, web push subs found:", subs.length);

      const results = await Promise.allSettled(
        subs.map((sub) =>
          sendToSubscription(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
          ),
        ),
      );
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`[notify] web-push sub[${i}] failed:`, r.reason);
      });
    }
  } catch (err) {
    console.error("[notify] top-level error:", err);
  }
}
