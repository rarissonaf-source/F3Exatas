"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon,
  iconBg,
  backHref,
  backLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconBg?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div
      className="relative mx-auto my-8 w-full max-w-4xl overflow-hidden rounded-[28px] sm:my-10"
      style={{
        // Same diagonal navy → navy-tint → orange signature used by the hero banners
        // on F3Concursos/F3Cursos/F3Mentorias, so this reads as the same family of pages.
        background:
          "linear-gradient(100deg, var(--brand-navy) 0%, var(--brand-navy) 30%, #4d6aa0 55%, var(--brand-orange) 100%)",
      }}
    >
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        )}

        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md"
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-4 flex items-center gap-4"
        >
          {icon && (
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ring-1 ring-white/20"
              style={{ backgroundColor: iconBg }}
            >
              {icon}
            </span>
          )}
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white text-balance sm:text-5xl">
            {title}
          </h1>
        </motion.div>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-3 max-w-xl text-base text-white/70"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}
