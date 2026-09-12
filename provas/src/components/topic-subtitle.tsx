"use client";

import { useEffect, useState } from "react";
import { fetchCurrentProfile } from "@/lib/account";
import { hasProvasPlusAccess } from "@/lib/plan-access";

export function TopicSubtitle({ count }: { count: number }) {
  const [plusAllowed, setPlusAllowed] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((profile) => {
      setPlusAllowed(hasProvasPlusAccess(profile.email, profile.hasProvasPlus));
    });
  }, []);

  if (plusAllowed) {
    return (
      <>
        {count} {count !== 1 ? "questões" : "questão"} — clique para abrir.
      </>
    );
  }

  return <>Clique numa questão pra abrir.</>;
}
