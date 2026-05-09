"use server";

import { revalidatePath } from "next/cache";
import { setVideoTags, upsertTag } from "@/db/queries/tags";
import { softDeleteVideo, updateVideo } from "@/db/queries/videos";
import { getCurrentUser } from "@/lib/auth";

export async function deleteVideo(id: string) {
  const user = await getCurrentUser();
  if (!user.roles.includes("admin")) throw new Error("Unauthorized");

  await softDeleteVideo(id);
  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard/trainees", "layout");
}

export async function updateVideoMetadata(
  id: string,
  input: { title: string; description: string | null; tagNames: string[] },
) {
  const user = await getCurrentUser();
  const allowed = user.roles.some((r) =>
    ["admin", "trainer_manager", "trainer"].includes(r),
  );
  if (!allowed) throw new Error("Unauthorized");

  await updateVideo(id, { title: input.title, description: input.description });

  const tagRecords = await Promise.all(input.tagNames.map((n) => upsertTag(n)));
  const tagIds = tagRecords.filter(Boolean).map((t) => t!.id);
  await setVideoTags(id, tagIds);

  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard/trainees", "layout");
}
