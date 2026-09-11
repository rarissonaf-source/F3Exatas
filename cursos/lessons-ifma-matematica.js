// Acesso liberado pra quem já está logado no site (auth-gate.js) com um dos
// e-mails administrativos — ver window.F3Exatas.hasCourseAccess() em
// ../auth-gate.js, que é a fonte única dessa lista por enquanto.

// Aulas do curso "Matemática para o Técnico Integrado do IFMA", organizadas
// pelos mesmos assuntos usados no F3Provas (src/lib/topics.ts, MATH_TOPICS).
// Para adicionar uma aula nova, inclua um item no array "videos" do módulo
// correspondente: { title: "Nome da aula", youtubeUrl: "https://youtu.be/XXXX" }.
const modules = [
  {
    slug: "numeros-operacoes",
    name: "Números e Operações",
    videos: [
      { title: "Mínimo Múltiplo Comum (MMC)", youtubeUrl: "https://youtu.be/0uXv8Uhy1TU" },
      { title: "Notação científica 1", youtubeUrl: "https://youtu.be/XKVo2OKsa5o" },
      { title: "Notação científica 2", youtubeUrl: "https://youtu.be/P8jEmpMWxww" },
      { title: "Regra de três", youtubeUrl: "https://youtu.be/nsbZc42EyJo" },
      { title: "Fatoração em números primos", youtubeUrl: "https://youtu.be/APfsdOpQKCo" },
      { title: "Conversão de unidades", youtubeUrl: "https://youtu.be/xCR_YNzDMsI" },
      { title: "Cálculo de média", youtubeUrl: "https://youtu.be/iUltbIYany8" },
      { title: "Aritmética 2", youtubeUrl: "https://youtu.be/yymL59CShXk" },
    ],
  },
  { slug: "fracoes-decimais", name: "Frações e Números Decimais", videos: [] },
  {
    slug: "razao-proporcao-porcentagem",
    name: "Razão, Proporção e Porcentagem",
    videos: [
      { title: "Divisão proporcional 1", youtubeUrl: "https://youtu.be/23W6jkWDBIY" },
      { title: "Porcentagem 1", youtubeUrl: "https://youtu.be/xi2EdHRNUg4" },
      { title: "Razão 1", youtubeUrl: "https://youtu.be/srQvz26H_t8" },
      { title: "Porcentagem 2", youtubeUrl: "https://youtu.be/CZHjEqK76LQ" },
      { title: "Razão 2", youtubeUrl: "https://youtu.be/gNpvUCQuQf8" },
      { title: "Divisão proporcional 2", youtubeUrl: "https://youtu.be/fhpEogRAi2w" },
      { title: "Porcentagem 3", youtubeUrl: "https://youtu.be/r_lfdhSCThk" },
      { title: "Regra de três 2", youtubeUrl: "https://youtu.be/bOYNL34WhOY" },
      { title: "Aumento percentual 1", youtubeUrl: "https://youtu.be/mpaUpoLTzi0" },
    ],
  },
  { slug: "algebra-expressoes", name: "Álgebra e Expressões", videos: [] },
  {
    slug: "equacoes-inequacoes",
    name: "Equações e Inequações",
    videos: [
      { title: "Equação do 1º grau", youtubeUrl: "https://youtu.be/aErX2jxONBw" },
    ],
  },
  { slug: "sistemas-equacoes", name: "Sistemas de Equações", videos: [] },
  {
    slug: "funcoes",
    name: "Funções",
    videos: [
      { title: "Função do 1º grau 1", youtubeUrl: "https://youtu.be/_tS9QOxTKW0" },
      { title: "Função do 1º grau 2", youtubeUrl: "https://youtu.be/XU9ZmBBhE_w" },
    ],
  },
  {
    slug: "geometria-plana",
    name: "Geometria Plana",
    videos: [
      { title: "Área do círculo 1", youtubeUrl: "https://www.youtube.com/watch?v=LYVydfDbwz8" },
      { title: "Teorema de Pitágoras 1", youtubeUrl: "https://youtu.be/wgfUCreeePc" },
      { title: "Área do triângulo retângulo", youtubeUrl: "https://youtu.be/mufUGz4I7QU" },
      { title: "Teorema de Pitágoras 2", youtubeUrl: "https://youtu.be/pTKtQk9BoOA" },
      { title: "Área do trapézio", youtubeUrl: "https://youtu.be/K87eynALmSE" },
      { title: "Área do círculo 2", youtubeUrl: "https://youtu.be/TZcyykntzz4" },
      { title: "Área e regra de três 1", youtubeUrl: "https://youtu.be/iJSn5KBcHUc" },
      { title: "Geometria Plana e Equação do 2º Grau", youtubeUrl: "https://youtu.be/sOCvXv-b_CY" },
    ],
  },
  {
    slug: "geometria-espacial",
    name: "Geometria Espacial",
    videos: [
      { title: "Volume do paralelepípedo", youtubeUrl: "https://www.youtube.com/watch?v=qXfhD4p-trQ" },
    ],
  },
  { slug: "trigonometria", name: "Trigonometria", videos: [] },
  {
    slug: "estatistica-probabilidade",
    name: "Estatística e Probabilidade",
    videos: [
      { title: "Leitura e interpretação de gráficos 1", youtubeUrl: "https://www.youtube.com/watch?v=fWnBL6qRe8M" },
      { title: "Probabilidade 1", youtubeUrl: "https://youtu.be/op12oJSVEuA" },
      { title: "Leitura e interpretação de gráficos 2", youtubeUrl: "https://youtu.be/2bICD9E-ESU" },
      { title: "Probabilidade 2", youtubeUrl: "https://youtu.be/vmOFz6DcYPU" },
      { title: "Média Aritmética 1", youtubeUrl: "https://youtu.be/4883NeXcoS8" },
      { title: "Aritmética 1", youtubeUrl: "https://youtu.be/1Lr8sDfiybI" },
      { title: "Estatística Descritiva 1", youtubeUrl: "https://youtu.be/0aQK1mKDEr4" },
      { title: "Probabilidade 3", youtubeUrl: "https://youtu.be/PsRAKJe5kRk" },
    ],
  },
  {
    slug: "matematica-financeira",
    name: "Matemática Financeira",
    videos: [
      { title: "Juros simples 1", youtubeUrl: "https://www.youtube.com/watch?v=i_tXQaSmOuw" },
      { title: "Juros simples 2", youtubeUrl: "https://youtu.be/a646B7GAZJM" },
    ],
  },
  { slug: "combinatoria", name: "Análise Combinatória", videos: [] },
  {
    slug: "progressoes",
    name: "Progressões (PA e PG)",
    videos: [
      { title: "Progressão Aritmética (PA)", youtubeUrl: "https://youtu.be/eRjYlqmAWYQ" },
    ],
  },
];

// Ícone de linha simples por assunto, mesmo estilo dos badges "por que
// escolher" (stroke, minimalista) — só pra dar identidade visual ao quadro,
// sem depender de ilustração externa.
const TOPIC_ICONS = {
  "numeros-operacoes": '<rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11.5" x2="8" y2="11.5"/><line x1="12" y1="11.5" x2="12" y2="11.5"/><line x1="16" y1="11.5" x2="16" y2="11.5"/><line x1="8" y1="15.5" x2="8" y2="15.5"/><line x1="12" y1="15.5" x2="12" y2="15.5"/><line x1="16" y1="15.5" x2="16" y2="15.5"/>',
  "fracoes-decimais": '<line x1="7" y1="19" x2="17" y2="5"/><circle cx="8" cy="7" r="1.6" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="1.6" fill="currentColor" stroke="none"/>',
  "razao-proporcao-porcentagem": '<circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><line x1="6" y1="18" x2="18" y2="6"/>',
  "algebra-expressoes": '<path d="M9 4c-2 0-3 1-3 3v3c0 1-1 2-2 2 1 0 2 1 2 2v3c0 2 1 3 3 3"/><path d="M15 4c2 0 3 1 3 3v3c0 1 1 2 2 2-1 0-2 1-2 2v3c0 2-1 3-3 3"/>',
  "equacoes-inequacoes": '<line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/>',
  "sistemas-equacoes": '<path d="M7 4c-1.5 0-2 .5-2 2v4c0 1-.5 1.5-1.5 2 1 .5 1.5 1 1.5 2v4c0 1.5.5 2 2 2"/><line x1="12" y1="8" x2="18" y2="8"/><line x1="12" y1="12" x2="18" y2="12"/><line x1="12" y1="16" x2="18" y2="16"/>',
  funcoes: '<path d="M4 16c3-1 5-9 8-9s5 8 8 9"/><line x1="4" y1="20" x2="20" y2="20"/>',
  "geometria-plana": '<path d="M12 3 21 20 3 20Z"/>',
  "geometria-espacial": '<path d="M12 3 20 7.5V16.5L12 21 4 16.5V7.5Z"/><path d="M12 3V21"/><path d="M4 7.5 12 12 20 7.5"/>',
  trigonometria: '<path d="M5 19h14"/><path d="M5 19 15 6"/><path d="M8.7 19a5.3 5.3 0 0 1 2.1-4.2"/>',
  "estatistica-probabilidade": '<line x1="5" y1="20" x2="5" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="19" y1="20" x2="19" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>',
  "matematica-financeira": '<path d="M4 17 10 11 14 15 20 7"/><path d="M15 7h5v5"/>',
  combinatoria: '<path d="M4 6h3.5c2 0 3 1 4.5 3l5 8c1 1.5 2.5 2 4 2H21"/><path d="M4 18h3.5c2 0 3-1 4.5-3"/><path d="M18 4 21 7 18 10"/><path d="M18 14 21 17 18 20"/>',
  progressoes: '<circle cx="5" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="10.3" cy="13" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.6" cy="8" r="1.4" fill="currentColor" stroke="none"/><path d="M6 17 9.3 13.9M11.6 12 14.9 8.9" /><path d="M17 4 21 4 21 8"/>',
};

function getYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /[?&]v=([^?&]+)/,
    /embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function openPlayer(videoId, title) {
  const modal = document.getElementById("player-modal");
  const frame = document.getElementById("player-frame");
  const caption = document.getElementById("player-caption");
  frame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0&modestbranding=1";
  caption.textContent = title;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closePlayer() {
  const modal = document.getElementById("player-modal");
  const frame = document.getElementById("player-frame");
  frame.src = "";
  modal.hidden = true;
  document.body.style.overflow = "";
}

function initPlayerModal() {
  const modal = document.getElementById("player-modal");
  if (!modal) return;
  document.getElementById("player-close").addEventListener("click", closePlayer);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closePlayer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closePlayer();
  });
}

function renderModules() {
  const container = document.getElementById("topics-list");
  if (!container) return;

  modules.forEach((mod, index) => {
    const details = document.createElement("details");
    details.className = "topic-item reveal";
    details.style.transitionDelay = (index % 6) * 0.06 + "s";

    const hasVideos = mod.videos.length > 0;
    const iconColor = index % 2 === 0 ? "navy" : "orange";

    const summary = document.createElement("summary");
    summary.className = "topic-summary";
    summary.innerHTML = `
      <span class="topic-icon-badge topic-icon-${iconColor}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TOPIC_ICONS[mod.slug] || ""}</svg>
      </span>
      <span class="topic-card-text">
        <span class="topic-title">${mod.name}</span>
        <span class="topic-count${hasVideos ? " has-videos" : ""}">${hasVideos ? mod.videos.length + (mod.videos.length === 1 ? " aula" : " aulas") : "Em breve"}</span>
      </span>
      <span class="topic-chevron">&#8250;</span>
    `;
    details.appendChild(summary);

    if (hasVideos) {
      const grid = document.createElement("div");
      grid.className = "lesson-grid";
      mod.videos.forEach((video) => {
        const videoId = getYouTubeId(video.youtubeUrl);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lesson-thumb";
        btn.innerHTML = `
          <span class="lesson-thumb-img-wrap">
            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="" loading="lazy">
            <span class="lesson-thumb-play">&#9654;</span>
          </span>
          <span class="lesson-thumb-title">${video.title}</span>
        `;
        btn.addEventListener("click", () => {
          if (videoId) openPlayer(videoId, video.title);
        });
        grid.appendChild(btn);
      });
      details.appendChild(grid);
    } else {
      const empty = document.createElement("p");
      empty.className = "topic-empty";
      empty.textContent = "Aulas em produção.";
      details.appendChild(empty);
    }

    container.appendChild(details);
  });
}

function initScrollReveal(scope) {
  const revealEls = (scope || document).querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

// Provas oficiais do Integrado dos últimos anos, já comentadas em PDF — os
// arquivos ficam em provas/content/course-materials/ifma-matematica/<fileName>,
// fora da pasta public (não são servidos direto, só via /api/course-materials,
// que carimba o PDF com os dados de quem baixou antes de entregar).
const MATERIALS = [
  { label: "Integrado 2026", fileName: "ifma-integrado-2026.pdf" },
  { label: "Integrado 2025", fileName: "ifma-integrado-2025.pdf" },
  { label: "Integrado 2024", fileName: "ifma-integrado-2024.pdf" },
  { label: "Integrado 2023", fileName: "ifma-integrado-2023.pdf" },
  { label: "Integrado 2022", fileName: "ifma-integrado-2022.pdf" },
];

function renderMaterials() {
  const section = document.getElementById("materials-section");
  const list = document.getElementById("materials-list");
  if (!section || !list) return;

  const email = (window.F3Exatas && window.F3Exatas.getCurrentEmail && window.F3Exatas.getCurrentEmail()) || "";
  const name = (window.F3Exatas && window.F3Exatas.getCurrentName && window.F3Exatas.getCurrentName()) || "";

  list.innerHTML = MATERIALS.map((m) => {
    const url =
      "/provas/api/course-materials/ifma-matematica/" +
      encodeURIComponent(m.fileName) +
      "?email=" +
      encodeURIComponent(email) +
      "&name=" +
      encodeURIComponent(name);
    return (
      '<a class="material-item" href="' + url + '" target="_blank" rel="noopener">' +
      '<span class="material-name">' + m.label + "</span>" +
      '<span class="material-download">Baixar PDF <span>&#8594;</span></span>' +
      "</a>"
    );
  }).join("");

  section.hidden = false;
  section.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

function grantAccess() {
  document.getElementById("access-gate").hidden = true;
  const lessonsSection = document.getElementById("lessons-section");
  lessonsSection.hidden = false;
  renderModules();
  renderMaterials();
  // Conteúdo liberado após interação — mostra direto, sem esperar o scroll.
  lessonsSection.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

function denyAccess() {
  const gate = document.getElementById("access-gate");
  if (!gate) return;
  gate.querySelector(".section-subtitle").textContent =
    "Você ainda não adquiriu este curso ou não tem acesso liberado. Fale com a F3Exatas pra saber como garantir o seu.";
  const goBackLink = document.getElementById("gate-back-link");
  if (goBackLink) goBackLink.hidden = false;
}

function initAccessGate() {
  const gate = document.getElementById("access-gate");
  if (!gate) return;

  if (window.F3Exatas && window.F3Exatas.hasCourseAccess && window.F3Exatas.hasCourseAccess()) {
    grantAccess();
  } else {
    denyAccess();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAccessGate();
  initPlayerModal();
  initScrollReveal();
});
