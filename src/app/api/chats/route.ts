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

  const body = (await request.json()) as { traineeId?: string };
  if (!body.traineeId?.trim()) {
    return Response.json({ error: "traineeId is required" }, { status: 400 });
  }
  const traineeId = body.traineeId.trim();

  // The trainee themselves, or any trainer/admin/manager, can open the thread.
  const privileged = new Set(["admin", "trainer_manager", "trainer"] as const);
  const isTrainee = user.id === traineeId;
  if (!isTrainee && !user.roles.some((r) => privileged.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const chat = await getOrCreateChat(traineeId);
  return Response.json({ data: chat }, { status: 201 });
}
