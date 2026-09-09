"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { DiagnosisPanel } from "@/components/diagnosis-panel";
import { fetchCurrentProfile } from "@/lib/account";
import { hasPerformanceAccess } from "@/lib/performance";

export default function MeuDesempenhoPage() {
  const [checkedAccess, setCheckedAccess] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((profile) => {
      setAllowed(hasPerformanceAccess(profile.email, profile.hasProvasPlus));
      setCheckedAccess(true);
    });
  }, []);

  if (!checkedAccess) return null;

  return (
    <main className="flex-1">
      <PageHero
        title="Meu Desempenho"
        subtitle="Acompanhe seus acertos e erros por assunto, e foque no que mais precisa."
        icon={<BarChart3 className="size-7" />}
        iconBg="#0891b2"
        backHref="/"
        backLabel="F3Provas"
      />

      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <DiagnosisPanel allowed={allowed} />
      </div>
    </main>
  );
}
