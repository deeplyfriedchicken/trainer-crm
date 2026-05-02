import type { NextRequest } from "next/server";
import { listTags, upsertTag } from "@/db/queries/tags";
import { getApiUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await listTags();
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const tag = await upsertTag(name);
  return Response.json({ data: tag }, { status: 201 });
}
