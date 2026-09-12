// Acesso liberado pra quem já está logado no site (auth-gate.js) com um dos
// e-mails administrativos — ver window.F3Exatas.hasCourseAccess() em
// ../auth-gate.js, que é a fonte única dessa lista por enquanto.

// Aulas do curso "Física para o Vestibular da UVA", organizadas pelos mesmos
// assuntos usados no F3Provas (provas/src/lib/topics.ts, PHYSICS_TOPICS).
// Ao contrário do IFMA, aqui só entra módulo pra assunto que já tem aula --
// nada de listar os 14 assuntos com "Em breve" de antemão. Pra adicionar um
// assunto novo, inclua um objeto { slug, name, videos: [...] } (ver
// PHYSICS_TOPICS pro slug/nome oficial de cada assunto).
const modules = [
  {
    slug: "cinematica",
    name: "Cinemática",
    videos: [{ title: "Velocidade do som", youtubeUrl: "https://youtu.be/L66wkQFMm20" }],
  },
  {
    slug: "eletrodinamica",
    name: "Eletrodinâmica",
    videos: [{ title: "Associação de Geradores", youtubeUrl: "https://youtu.be/2cMCuNbjaH4" }],
  },
];

// Ícone de linha simples por assunto, mesmo estilo dos badges "por que
// escolher" (stroke, minimalista) — só pra dar identidade visual ao quadro,
// sem depender de ilustração externa.
const TOPIC_ICONS = {
  cinematica: '<path d="M4 12h11"/><path d="M11 7l5 5-5 5"/><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  dinamica: '<path d="M3 12h6"/><path d="M6 9l3 3-3 3"/><path d="M21 12h-6"/><path d="M18 9l-3 3 3 3"/>',
  estatica: '<path d="M12 3v3"/><path d="M5 6h14"/><path d="M5 6l-3 6a3 3 0 0 0 6 0z"/><path d="M19 6l-3 6a3 3 0 0 0 6 0z"/><path d="M12 6v15"/><path d="M8 21h8"/>',
  "trabalho-energia": '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  "impulso-momento": '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6"/>',
  gravitacao: '<circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4"/>',
  hidrostatica: '<path d="M12 3c-3 4-5 6.5-5 9a5 5 0 0 0 10 0c0-2.5-2-5-5-9Z"/>',
  termologia: '<path d="M12 14.5V4a2 2 0 1 0-4 0v10.5a4 4 0 1 0 4 0Z"/><circle cx="10" cy="17" r="1.3" fill="currentColor" stroke="none"/>',
  ondulatoria: '<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  optica: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eletrostatica: '<path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.9 4.9l2.8 2.8"/><path d="M16.3 16.3l2.8 2.8"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.9 19.1l2.8-2.8"/><path d="M16.3 7.7l2.8-2.8"/>',
  eletrodinamica: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  eletromagnetismo: '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 4h4"/><path d="M14 4h4"/><path d="M6 9h4"/><path d="M14 9h4"/>',
  "fisica-moderna": '<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
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

function grantAccess() {
  document.getElementById("access-gate").hidden = true;
  const lessonsSection = document.getElementById("lessons-section");
  lessonsSection.hidden = false;
  renderModules();
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
