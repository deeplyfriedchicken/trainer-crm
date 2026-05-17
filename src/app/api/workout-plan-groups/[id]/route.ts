import type { NextRequest } from "next/server";
import {
  getWorkoutPlanGroup,
  PublishedPlanDeleteError,
  softDeletePlanGroup,
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

// @invokes softDeletePlanGroup — rejects with 409 if the group has a published plan
// @errors 401 unauthorized | 404 group not found | 409 published plan exists
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const group = await getWorkoutPlanGroup(id);
  if (!group)
    return Response.json({ error: "Group not found" }, { status: 404 });

  try {
    await softDeletePlanGroup(id, user.id);
  } catch (err) {
    if (err instanceof PublishedPlanDeleteError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }

  return new Response(null, { status: 204 });
}
