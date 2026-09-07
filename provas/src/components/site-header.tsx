// Minimal wayfinding strip — matches the "‹ F3Exatas" pattern used at the top of
// F3Concursos, F3Cursos and F3Mentorias, instead of a full navy bar.
export function SiteHeader() {
  return (
    <div className="mx-auto flex w-full max-w-4xl items-center px-6 pt-5 font-heading text-[13px]">
      {/* Plain <a>, not next/link: this must escape the app's "/provas" basePath and land
          on the hub's own root ("/"), not get auto-prefixed to "/provas". */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="font-bold tracking-wide text-foreground/90 transition-colors hover:text-brand-orange"
      >
        &lsaquo; F3Exatas
      </a>
    </div>
  );
}
