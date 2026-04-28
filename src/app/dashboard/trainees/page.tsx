import { getCurrentUser } from "@/lib/auth";
import { listTrainees } from "@/db/queries/trainees";
import { TraineeTable } from "../_components/TraineeTable";

export default async function TraineesPage() {
  const [currentUser, trainees] = await Promise.all([
    getCurrentUser(),
    listTrainees({ limit: 100, offset: 0 }),
  ]);

  const canAdd = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );

  return (
    <div className="crm-page">
      <TraineeTable trainees={trainees} canAdd={canAdd} />
    </div>
  );
}
