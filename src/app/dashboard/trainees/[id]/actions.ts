"use server";

import { createMessage } from "@/db/queries/chats";
import { getCurrentUser } from "@/lib/auth";

export async function sendMessage(chatId: string, text: string) {
  const user = await getCurrentUser();
  return createMessage(chatId, user.id, { text });
}
