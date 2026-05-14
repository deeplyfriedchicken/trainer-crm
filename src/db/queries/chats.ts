import { and, asc, desc, eq, exists, or } from "drizzle-orm";
import { db } from "@/db";
import { chats, type MessageContent, messages } from "@/db/schema";
import { notifyRecipients } from "@/lib/notifications";

export async function listChatsForUser(userId: string) {
  return db.query.chats.findMany({
    where: or(
      eq(chats.traineeId, userId),
      exists(
        db
          .select({ one: messages.id })
          .from(messages)
          .where(
            and(eq(messages.chatId, chats.id), eq(messages.senderId, userId)),
          ),
      ),
    ),
    with: {
      trainee: { columns: { id: true, name: true, email: true } },
      messages: {
        orderBy: [desc(messages.createdAt)],
        limit: 1,
        with: { sender: { columns: { id: true, name: true, email: true } } },
      },
    },
    orderBy: [desc(chats.updatedAt)],
  });
}

export async function getChatById(chatId: string) {
  return db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      trainee: { columns: { id: true, name: true, email: true } },
      messages: {
        orderBy: [asc(messages.createdAt)],
        with: { sender: { columns: { id: true, name: true, email: true } } },
      },
    },
  });
}

export async function getOrCreateChat(traineeId: string) {
  const existing = await db.query.chats.findFirst({
    where: eq(chats.traineeId, traineeId),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
        with: { sender: { columns: { id: true, name: true, email: true } } },
      },
    },
  });

  if (existing) return existing;

  const [created] = await db.insert(chats).values({ traineeId }).returning();

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

  if (withSender) {
    await notifyRecipients(
      chatId,
      senderId,
      withSender.sender.name,
      content.text,
    );
  }

  return withSender;
}
