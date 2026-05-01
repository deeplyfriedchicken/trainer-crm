import type { NextRequest } from "next/server";
import { listTrainers, createTrainer } from "@/db/queries/trainers";
import { getRequestUser } from "@/lib/request-auth";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const { limit, offset } = parsePagination(params);
  const data = await listTrainers({ limit, offset });
  return Response.json({ data, pagination: { limit, offset } });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = new Set(["admin", "trainer_manager"] as const);
  if (!user.roles.some((r) => allowed.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { name?: string; email?: string; role?: string };
  if (!body.name?.trim() || !body.email?.trim()) {
    return Response.json({ error: "name and email are required" }, { status: 400 });
  }

  const role =
    body.role === "trainer_manager" ? "trainer_manager" : "trainer";

  const trainer = await createTrainer({
    name: body.name.trim(),
    email: body.email.trim(),
    role,
  });
  return Response.json({ data: trainer }, { status: 201 });
}
