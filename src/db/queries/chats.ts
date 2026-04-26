import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, type MessageContent, messages } from "@/db/schema";

export async function getOrCreateChat(traineeId: string, trainerId: string) {
  const existing = await db.query.chats.findFirst({
    where: and(eq(chats.traineeId, traineeId), eq(chats.trainerId, trainerId)),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
        with: { sender: { columns: { id: true, name: true, email: true } } },
      },
    },
  });

  if (existing) return existing;

  const [created] = await db
    .insert(chats)
    .values({ traineeId, trainerId })
    .returning();

  return {
    ...created,
    messages: [] as (typeof messages.$inferSelect & {
      sender: { id: string; name: string; email: string };
    })[],
  };
}

export async function getChatMessages(chatId: string) {
  return db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: [asc(messages.createdAt)],
    with: { sender: { columns: { id: true, name: true, email: true } } },
  });
}

export async function createMessage(
  chatId: string,
  senderId: string,
  content: MessageContent,
) {
  const [msg] = await db
    .insert(messages)
    .values({ chatId, senderId, content })
    .returning();

  const withSender = await db.query.messages.findFirst({
    where: eq(messages.id, msg.id),
    with: { sender: { columns: { id: true, name: true, email: true } } },
  });

  return withSender;
}
