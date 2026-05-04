"use server";

import { revalidatePath } from "next/cache";
import { softDeleteVideo } from "@/db/queries/videos";
import { getCurrentUser } from "@/lib/auth";

export async function deleteVideo(id: string) {
  const user = await getCurrentUser();
  if (!user.roles.includes("admin")) throw new Error("Unauthorized");

  await softDeleteVideo(id);
  revalidatePath("/dashboard/videos");
}
