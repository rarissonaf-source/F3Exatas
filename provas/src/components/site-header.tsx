"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy text-white shadow-md"
    >
      <div className="mx-auto flex h-20 w-full max-w-4xl items-center px-6">
        <Link href="/" className="group flex items-center gap-3 font-heading font-bold tracking-tight">
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <Image src="/brand/f3-logo.jpg" alt="F3" fill sizes="48px" className="object-cover" priority />
          </span>
          <span className="text-xl uppercase tracking-wide">
            F3 <span className="text-brand-orange">Provas</span>
          </span>
        </Link>
      </div>
    </motion.header>
  );
}
