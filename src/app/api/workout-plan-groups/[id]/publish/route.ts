import type { NextRequest } from "next/server";
import { publishNewVersion } from "@/db/queries/workout-plan-groups";
import type { ExerciseInput } from "@/db/queries/workout-plans";
import { getRequestUser } from "@/lib/request-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = (await request.json()) as {
    name?: string;
    comment?: string;
    exercises?: ExerciseInput[];
  };

  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const plan = await publishNewVersion({
      groupId: id,
      name: body.name.trim(),
      comment: body.comment,
      exerciseInputs: body.exercises ?? [],
      publishedBy: user.id,
    });

    return Response.json({ data: plan }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Group not found") {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
    throw err;
  }
}
