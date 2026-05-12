import type { NextRequest } from "next/server";
import {
  deleteTrainee,
  getTraineeById,
  updateTrainee,
} from "@/db/queries/trainees";
import { getRequestUser } from "@/lib/request-auth";

// @invokes getTraineeById(id)
// @errors 401 unauthorized | 404 trainee not found
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trainee = await getTraineeById(id);
  if (!trainee)
    return Response.json({ error: "Trainee not found" }, { status: 404 });
  return Response.json({ data: trainee });
}

// @body { name?: string; email?: string }
// @invokes updateTrainee(id, { name, email })
// @errors 401 unauthorized | 404 trainee not found
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { name?: string; email?: string };
  const updated = await updateTrainee(id, body);
  if (!updated)
    return Response.json({ error: "Trainee not found" }, { status: 404 });
  return Response.json({ data: updated });
}

// @invokes deleteTrainee(id)
// @errors 401 unauthorized | 403 forbidden | 204 no content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = new Set(["admin", "trainer_manager"] as const);
  if (!user.roles.some((r) => allowed.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await deleteTrainee(id);
  return new Response(null, { status: 204 });
}
