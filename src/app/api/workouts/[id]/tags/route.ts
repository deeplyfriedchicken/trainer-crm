import type { NextRequest } from "next/server";
import { listWorkoutTags, setWorkoutTags } from "@/db/queries/tags";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;
  const tags = await listWorkoutTags(workoutId);
  return Response.json({ data: tags });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;

  const body = (await request.json()) as { tagIds?: unknown };

  if (!Array.isArray(body.tagIds)) {
    return Response.json({ error: "tagIds must be an array" }, { status: 400 });
  }

  await setWorkoutTags(workoutId, body.tagIds as string[], user.id);
  const tags = await listWorkoutTags(workoutId);
  return Response.json({ data: tags });
}
