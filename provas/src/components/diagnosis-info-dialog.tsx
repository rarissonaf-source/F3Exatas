"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DIAGNOSIS_MIN_QUESTIONS } from "@/lib/performance";

/** Botão independente ("Como funciona" + ícone de interrogação) que abre a explicação da cadência do diagnóstico (cooldown de 24h + mínimo de questões novas). Autocontido — não precisa de estado do componente pai. */
export function DiagnosisInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100"
          />
        }
      >
        <HelpCircle className="size-3.5" />
        Como funciona
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
        <DialogFooter>
          <DialogClose render={<Button />}>Entendi</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
