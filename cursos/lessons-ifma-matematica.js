// Acesso restrito por e-mail, por enquanto (checagem só no navegador, sem
// backend — não é uma trava contra alguém técnico, só um portão simples
// pra fase de pré-lançamento com poucas pessoas liberadas).
const ALLOWED_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];
const ACCESS_STORAGE_KEY = "f3cursos_ifma_matematica_access";

// Aulas do curso "Matemática para o Técnico Integrado do IFMA", organizadas
// pelos mesmos assuntos usados no F3Provas (src/lib/topics.ts, MATH_TOPICS).
// Para adicionar uma aula nova, inclua um item no array "videos" do módulo
// correspondente: { title: "Nome da aula", youtubeUrl: "https://youtu.be/XXXX" }.
const modules = [
  { slug: "numeros-operacoes", name: "Números e Operações", videos: [] },
  { slug: "fracoes-decimais", name: "Frações e Números Decimais", videos: [] },
  { slug: "razao-proporcao-porcentagem", name: "Razão, Proporção e Porcentagem", videos: [] },
  { slug: "algebra-expressoes", name: "Álgebra e Expressões", videos: [] },
  { slug: "equacoes-inequacoes", name: "Equações e Inequações", videos: [] },
  { slug: "sistemas-equacoes", name: "Sistemas de Equações", videos: [] },
  { slug: "funcoes", name: "Funções", videos: [] },
  {
    slug: "geometria-plana",
    name: "Geometria Plana",
    videos: [
      { title: "Área do círculo", youtubeUrl: "https://www.youtube.com/watch?v=LYVydfDbwz8" },
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
      { title: "Leitura e interpretação de gráficos", youtubeUrl: "https://www.youtube.com/watch?v=fWnBL6qRe8M" },
    ],
  },
  {
    slug: "matematica-financeira",
    name: "Matemática Financeira",
    videos: [
      { title: "Juros simples", youtubeUrl: "https://www.youtube.com/watch?v=i_tXQaSmOuw" },
    ],
  },
  { slug: "combinatoria", name: "Análise Combinatória", videos: [] },
  { slug: "progressoes", name: "Progressões (PA e PG)", videos: [] },
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
  frame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
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

function grantAccess(email) {
  localStorage.setItem(ACCESS_STORAGE_KEY, email);
  document.getElementById("access-gate").hidden = true;
  const lessonsSection = document.getElementById("lessons-section");
  lessonsSection.hidden = false;
  renderModules();
  // Conteúdo liberado após interação — mostra direto, sem esperar o scroll.
  lessonsSection.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

function initAccessGate() {
  const gateForm = document.getElementById("gate-form");
  const gateError = document.getElementById("gate-error");
  if (!gateForm) return;

  const savedEmail = localStorage.getItem(ACCESS_STORAGE_KEY);
  if (savedEmail && ALLOWED_EMAILS.includes(savedEmail.trim().toLowerCase())) {
    grantAccess(savedEmail.trim().toLowerCase());
    return;
  }

  gateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("gate-email").value.trim().toLowerCase();
    if (ALLOWED_EMAILS.includes(email)) {
      gateError.hidden = true;
      grantAccess(email);
    } else {
      gateError.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAccessGate();
  initPlayerModal();
  initScrollReveal();
});
