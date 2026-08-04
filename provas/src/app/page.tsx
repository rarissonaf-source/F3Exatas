"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, fadeUpItem } from "@/lib/motion";
import { INSTITUTIONS, STATES } from "@/lib/institutions";
import { BASE_PATH } from "@/lib/base-path";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [state, setState] = useState<string | null>(null);
  const institutions = state ? INSTITUTIONS.filter((i) => i.state === state) : INSTITUTIONS;

  return (
    <main className="relative flex-1">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto my-8 flex min-h-[300px] w-full max-w-4xl flex-col items-center gap-6 overflow-hidden rounded-[28px] px-6 py-10 sm:my-10 sm:flex-row sm:gap-0 sm:px-16"
        style={{
          // Same diagonal navy → navy-tint → orange signature used by the hero banners
          // on F3Concursos/F3Cursos/F3Mentorias, so this reads as the same family of pages.
          background:
            "linear-gradient(100deg, var(--brand-navy) 0%, var(--brand-navy) 30%, #4d6aa0 55%, var(--brand-orange) 100%)",
        }}
      >
        <div className="flex flex-1 flex-col items-center gap-[18px] text-center sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/brand/icons/provas.svg`}
            alt=""
            // Full-color icon (not a white silhouette) with a soft drop-shadow — same
            // treatment as the hub's path-card and the F3Cursos/F3Mentorias hero-logo.
            className="size-[90px] object-contain sm:size-[130px]"
            style={{ filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.35))" }}
          />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            F3 <span className="text-brand-orange">Provas</span>
          </h1>
        </div>

        <div className="hidden self-stretch border-l border-white/30 sm:block" />

        <div className="flex-1 text-center sm:pl-12 sm:text-left">
          <p className="font-heading text-xl font-bold leading-snug text-balance text-white sm:text-2xl">
            Questões de vestibular organizadas por instituição, disciplina e assunto.
          </p>
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={state === null ? "default" : "outline"}
            size="sm"
            onClick={() => setState(null)}
          >
            Todos os estados
          </Button>
          {STATES.map((s) => (
            <Button
              key={s.state}
              variant={state === s.state ? "default" : "outline"}
              size="sm"
              onClick={() => setState(s.state)}
            >
              {s.stateName}
            </Button>
          ))}
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {institutions.map((inst) => {
            const card = (
              <div
                className={`flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all ${
                  inst.comingSoon ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-md hover:border-brand-orange/40"
                }`}
              >
                <span className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border">
                  <Image src={`${BASE_PATH}${inst.logo}`} alt={inst.name} fill className="object-contain p-2.5" sizes="96px" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-lg font-bold tracking-tight">{inst.name}</h2>
                    {inst.comingSoon ? (
                      <Badge variant="secondary">Em breve</Badge>
                    ) : (
                      <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{inst.fullName}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
                    {inst.stateName}
                  </p>
                </div>
              </div>
            );

            return (
              <motion.div key={inst.slug} variants={fadeUpItem}>
                {inst.comingSoon ? (
                  card
                ) : (
                  <Link href={`/${inst.slug}`} className="group block">
                    {card}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}
