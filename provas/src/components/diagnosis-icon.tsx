/**
 * Ilustração de "diagnóstico/desempenho" no mesmo estilo visual dos ícones do
 * hub F3Exatas (assets/icons/*.svg): contornos grossos pretos, fundo creme,
 * preenchimentos navy/laranja e um acento em forma de estrela. Aqui como SVG
 * inline em vez de arquivo estático, já que só é usado dentro do F3Provas.
 */
export function DiagnosisIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* painel/tela */}
      <g stroke="#111827" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
        <rect x="30" y="42" width="140" height="126" rx="14" fill="#fdf6ea" />
        <rect x="64" y="30" width="72" height="24" rx="8" fill="#263959" />
      </g>
      {/* barras do gráfico, em ascensão (desempenho) */}
      <g stroke="#111827" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
        <rect x="52" y="118" width="24" height="36" rx="4" fill="#263959" />
        <rect x="88" y="96" width="24" height="58" rx="4" fill="#f38d33" />
        <rect x="124" y="72" width="24" height="82" rx="4" fill="#263959" />
      </g>
      {/* seta de tendência subindo, sobre as barras */}
      <path d="M52 100 L92 78 L124 92 L150 60" fill="none" stroke="#f38d33" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M132 60 L150 60 L150 78" fill="none" stroke="#f38d33" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      {/* acento em estrela, igual ao restante do sistema de ícones */}
      <path
        d="M158 132 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6 z"
        fill="#f38d33"
        stroke="#111827"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </svg>
  );
}
