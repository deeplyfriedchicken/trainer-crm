import { listTrainees } from "@/db/queries/trainees";
import { TraineeTable } from "../_components/TraineeTable";

export default async function TraineesPage() {
  const [trainees] = await Promise.all([
    listTrainees({ limit: 100, offset: 0 }),
  ]);

  return (
    <div className="crm-page">
      <TraineeTable trainees={trainees} />
    </div>
  );
}
