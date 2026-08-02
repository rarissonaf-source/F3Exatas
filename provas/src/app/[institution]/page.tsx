import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Atom, Calculator, ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MotionGrid, MotionItem } from "@/components/motion-grid";
import { PageHero } from "@/components/page-hero";
import { getInstitution } from "@/lib/institutions";
import { BASE_PATH } from "@/lib/base-path";

const DISCIPLINE_ICONS: Record<string, LucideIcon> = {
  fisica: Atom,
  matematica: Calculator,
};

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const { institution } = await params;
  const data = getInstitution(institution);
  if (!data) notFound();

  return (
    <main className="flex-1">
      <PageHero
        title={data.name}
        subtitle={`${data.fullName} — ${data.stateName}. Escolha uma disciplina.`}
        icon={
          <span className="relative block size-full overflow-hidden rounded-2xl bg-white">
            <Image src={`${BASE_PATH}${data.logo}`} alt={data.name} fill className="object-contain p-2" sizes="56px" />
          </span>
        }
        backHref="/"
        backLabel="Instituições"
      />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <MotionGrid className="grid gap-5 sm:grid-cols-2">
          {data.disciplines.map((d) => {
            const DisciplineIcon = DISCIPLINE_ICONS[d.slug] ?? Atom;
            return (
            <MotionItem key={d.slug}>
              <Link href={`/${institution}/${d.slug}`} className="group">
                <Card className="relative overflow-hidden p-6 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-brand-orange/40">
                  <div className="flex items-start gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-sm">
                      <DisciplineIcon className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-2xl font-bold tracking-tight">{d.name}</h2>
                        <ArrowRight className="size-5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Provas e questões de {d.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </MotionItem>
            );
          })}
        </MotionGrid>
      </div>
    </main>
  );
}
