"use client";

import { X } from "lucide-react";
import { DiagnosisPanel } from "@/components/diagnosis-panel";

export function DiagnosisModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold text-foreground">Diagnóstico</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <DiagnosisPanel />
      </div>
    </div>
  );
}
