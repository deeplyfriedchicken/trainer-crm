import type { NextRequest } from "next/server";
import { getOrCreateChat, listChatsForUser } from "@/db/queries/chats";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await listChatsForUser(user.id);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { traineeId?: string; trainerId?: string };
  if (!body.traineeId?.trim() || !body.trainerId?.trim()) {
    return Response.json({ error: "traineeId and trainerId are required" }, { status: 400 });
  }

  // Only allow participants or privileged roles to open a thread
  const privileged = new Set(["admin", "trainer_manager"] as const);
  const isParticipant = user.id === body.traineeId || user.id === body.trainerId;
  if (!isParticipant && !user.roles.some((r) => privileged.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const chat = await getOrCreateChat(body.traineeId.trim(), body.trainerId.trim());
  return Response.json({ data: chat }, { status: 201 });
}
