import { Box, SimpleGrid } from "@chakra-ui/react";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/PageHeader";
import { listTrainers } from "@/db/queries/trainers";
import { AddTrainerButton } from "../_components/AddTrainerButton";
import { TrainerCard } from "../_components/TrainerCard";

const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB", B: "#34FDFE", C: "#a78bfa", D: "#4ade80", E: "#fb923c",
  F: "#FD6DBB", G: "#34FDFE", H: "#a78bfa", I: "#4ade80", J: "#FD6DBB",
  K: "#34FDFE", L: "#a78bfa", M: "#4ade80", N: "#fb923c", O: "#FD6DBB",
  P: "#34FDFE", Q: "#a78bfa", R: "#4ade80", S: "#FD6DBB", T: "#34FDFE",
  U: "#a78bfa", V: "#4ade80", W: "#fb923c", X: "#FD6DBB", Y: "#34FDFE",
  Z: "#a78bfa",
};

function colorFor(name: string) {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

export default async function TrainersPage() {
  const [currentUser, trainers] = await Promise.all([
    getCurrentUser(),
    listTrainers({ limit: 100, offset: 0 }),
  ]);

  const canAdd = currentUser.roles.some((r) =>
    (["admin", "trainer_manager"] as const).includes(r as never),
  );
  const isAdmin = currentUser.roles.includes("admin");

  return (
    <Box className="crm-page">
      <PageHeader
        title="Trainers"
        subtitle={`${trainers.length} trainers on your team`}
        action={canAdd ? <AddTrainerButton isAdmin={isAdmin} /> : null}
      />

      {trainers.length === 0 ? (
        <Box className="crm-table-empty">No trainers found.</Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="20px">
          {trainers.map((t) => (
            <TrainerCard
              key={t.id}
              name={t.name}
              email={t.email}
              color={colorFor(t.name)}
              initial={t.name[0]?.toUpperCase() ?? "?"}
              videoCount={t.videoCount}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
