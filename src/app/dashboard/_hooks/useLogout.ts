"use client";

import { useRouter } from "next/navigation";

const useHandleLogout = () => {
  const router = useRouter();
  async function logout() {
    const _res = await fetch("/api/auth/logout", {
      method: "POST",
      redirect: "manual",
    });
    router.push("/login");
  }

  return { logout };
};

export default useHandleLogout;
