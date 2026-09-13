"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DIAGNOSIS_MIN_QUESTIONS, dismissDiagnosisExplainer } from "@/lib/performance";

/**
 * Botão de "i" que explica a cadência do diagnóstico (cooldown de 24h +
 * mínimo de questões novas). Controlado de fora (`open`/`onOpenChange`) pra
 * poder ser aberto automaticamente na primeira vez que o usuário esbarra no
 * cooldown ou na exigência de questões novas, além de poder ser reaberto a
 * qualquer momento clicando no ícone.
 */
export function DiagnosisInfoDialog({
  open,
  onOpenChange,
  triggerClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next && dontShowAgain) dismissDiagnosisExplainer();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className={
              triggerClassName ??
              "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            }
            aria-label="Como funciona o diagnóstico"
          />
        }
      >
        <Info className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Como funciona o diagnóstico</DialogTitle>
          <DialogDescription render={<div className="space-y-3 pt-1 text-left" />}>
            <p>
              Cada novo diagnóstico compara só as questões que você respondeu <strong>desde o diagnóstico
              anterior</strong> — não uma janela fixa de dias. Assim cada ponto do gráfico mostra sua evolução real
              de um diagnóstico pro outro.
            </p>
            <p>
              Por isso, um novo diagnóstico só fica disponível depois de <strong>24 horas</strong> desde o último
              e de você ter respondido pelo menos <strong>{DIAGNOSIS_MIN_QUESTIONS} questões novas</strong> nesse
              intervalo.
            </p>
            <p className="text-xs text-muted-foreground">
              Exemplo: hoje você responde 30 questões e gera seu 1º diagnóstico. Amanhã, depois de responder mais
              20 questões, seu 2º diagnóstico já sai considerando só essas 20 — não as 30 de ontem.
            </p>
          </DialogDescription>
        </DialogHeader>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Não mostrar essa explicação automaticamente de novo
        </label>
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
