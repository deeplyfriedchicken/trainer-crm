import type { NextRequest } from "next/server";
import {
  getWorkoutPlanGroup,
  updateWorkoutPlanGroupName,
} from "@/db/queries/workout-plan-groups";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const group = await getWorkoutPlanGroup(id);
  if (!group)
    return Response.json({ error: "Group not found" }, { status: 404 });

  return Response.json({ data: group });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { name?: string };

  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const group = await updateWorkoutPlanGroupName({
    groupId: id,
    name: body.name.trim(),
    updatedBy: user.id,
  });

  return Response.json({ data: group });
}
