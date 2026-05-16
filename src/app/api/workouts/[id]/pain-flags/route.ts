import type { NextRequest } from "next/server";
import {
  createPainFlag,
  listPainFlagsForWorkout,
} from "@/db/queries/pain-flags";
import { PAIN_LOCATIONS } from "@/lib/constants";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;
  const flags = await listPainFlagsForWorkout(workoutId);
  return Response.json({ data: flags });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;

  const body = (await request.json()) as {
    exerciseId?: string | null;
    workoutSetId?: string | null;
    location?: string;
    severity?: number;
    isRecurring?: boolean;
    note?: string | null;
  };

  if (!body.location) {
    return Response.json({ error: "location is required" }, { status: 400 });
  }
  if (!(PAIN_LOCATIONS as readonly string[]).includes(body.location)) {
    return Response.json(
      { error: `Invalid location. Must be one of: ${PAIN_LOCATIONS.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    body.severity == null ||
    !Number.isInteger(body.severity) ||
    body.severity < 1 ||
    body.severity > 10
  ) {
    return Response.json(
      { error: "severity must be an integer 1–10" },
      { status: 400 },
    );
  }

  const flag = await createPainFlag({
    workoutId,
    exerciseId: body.exerciseId,
    workoutSetId: body.workoutSetId,
    location: body.location,
    severity: body.severity,
    isRecurring: body.isRecurring,
    note: body.note,
    createdBy: user.id,
  });

  return Response.json({ data: flag }, { status: 201 });
}
