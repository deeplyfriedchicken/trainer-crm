import { useCurrentUser } from "@/providers/CurrentUserProvider";

export const usePermissions = () => {
  const currentUser = useCurrentUser();
  const canAddClient = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );
  const canAddTrainer = currentUser.roles.some((r) =>
    (["admin", "trainer_manager"] as const).includes(r as never),
  );
  const canAddTrainerAdmin = currentUser.roles.some((r) =>
    (["admin", "trainer_manager"] as const).includes(r as never),
  );

  const canDeleteClient = currentUser.roles.some((r) =>
    (["admin", "trainer_manager"] as const).includes(r as never),
  );

  const canDeleteVideo = currentUser.roles.includes("admin");
  const canEditVideo = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );

  return {
    canAddClient,
    canAddTrainer,
    canAddTrainerAdmin,
    canDeleteClient,
    canDeleteVideo,
    canEditVideo,
  };
};
