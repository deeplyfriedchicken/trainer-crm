import type { NextRequest } from "next/server";
import {
  createMessage,
  getChatById,
  getChatMessages,
} from "@/db/queries/chats";
import { getRequestUser } from "@/lib/request-auth";

const PRIVILEGED = new Set(["admin", "trainer_manager", "trainer"] as const);

async function resolveChat(
  chatId: string,
  user: { id: string; roles: string[] },
) {
  const chat = await getChatById(chatId);
  if (!chat) return null;
  const isTrainee = chat.traineeId === user.id;
  const isPrivileged = user.roles.some((r) => PRIVILEGED.has(r as never));
  return isTrainee || isPrivileged ? chat : null;
}

// @invokes getChatById(id), getChatMessages(id)
// @errors 401 unauthorized | 404 chat not found or access denied
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chat = await resolveChat(id, user);
  if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });

  const data = await getChatMessages(id);
  return Response.json({ data });
}

// @body { text: string }
// @invokes getChatById(id), createMessage(id, user.id, {text})
// @errors 400 text required | 401 unauthorized | 404 chat not found or access denied | 201 created
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chat = await resolveChat(id, user);
  if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });

  const body = (await request.json()) as { text?: string };
  if (!body.text?.trim()) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const message = await createMessage(id, user.id, { text: body.text.trim() });
  return Response.json({ data: message }, { status: 201 });
}
