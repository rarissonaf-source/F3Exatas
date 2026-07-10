const topics = [
  {
    n: 1,
    title: "História e evolução das ideias da Física.",
    subs: [
      "1.1 Cosmologia antiga.",
      "1.2 Física de Aristóteles.",
      "1.3 Origens da mecânica.",
      "1.4 Surgimento da teoria da relatividade e da teoria quântica."
    ]
  },
  {
    n: 2,
    title: "Mecânica.",
    subs: [
      "2.1 Cinemática escalar e vetorial.",
      "2.2 Movimento circular.",
      "2.3 Leis de Newton e suas aplicações.",
      "2.4 Trabalho.",
      "2.5 Potência.",
      "2.6 Energia, conservação e suas transformações, impulso.",
      "2.7 Quantidade de movimento, conservação da quantidade de movimento.",
      "2.8 Gravitação universal.",
      "2.9 Estática dos corpos rígidos.",
      "2.10 Estática dos fluidos.",
      "2.11 Princípios de Pascal, Arquimedes e Stevin."
    ]
  },
  {
    n: 3,
    title: "Termodinâmica.",
    subs: [
      "3.1 Calor e temperatura.",
      "3.2 Temperatura e dilatação térmica.",
      "3.3 Calor específico.",
      "3.4 Trocas de calor.",
      "3.5 Mudança de fase e diagramas de fases.",
      "3.6 Propagação do calor.",
      "3.7 Teoria cinética dos gases.",
      "3.8 Energia interna.",
      "3.9 Lei de Joule.",
      "3.10 Transformações gasosas.",
      "3.11 Leis da termodinâmica: entropia e entalpia.",
      "3.12 Máquinas térmicas.",
      "3.13 Ciclo de Carnot."
    ]
  },
  {
    n: 4,
    title: "Eletromagnetismo.",
    subs: [
      "4.1 Introdução à eletricidade.",
      "4.2 Campo elétrico.",
      "4.3 Lei de Gauss.",
      "4.4 Potencial elétrico.",
      "4.5 Corrente elétrica.",
      "4.6 Potência elétrica e resistores.",
      "4.7 Circuitos elétricos.",
      "4.8 Campo magnético.",
      "4.9 Lei de Ampère.",
      "4.10 Lei de Faraday.",
      "4.11 Propriedades elétricas e magnéticas dos materiais.",
      "4.12 Equações de Maxwell.",
      "4.13 Radiação."
    ]
  },
  {
    n: 5,
    title: "Ondulatória.",
    subs: [
      "5.1 Movimento harmônico simples.",
      "5.2 Oscilações livres, amortecidas e forçadas.",
      "5.3 Ondas.",
      "5.4 Ondas sonoras e eletromagnéticas.",
      "5.5 Frequências naturais e ressonância.",
      "5.6 Ótica geométrica: reflexão e refração da luz.",
      "5.7 Instrumentos ópticos – características e aplicações."
    ]
  },
  {
    n: 6,
    title: "Ótica Física: interferência; difração; polarização.",
    subs: []
  },
  {
    n: 7,
    title: "Física Moderna.",
    subs: [
      "7.1 Introdução à Relatividade Especial, transformação de Lorentz.",
      "7.2 Equivalência Massa-Energia.",
      "7.3 Natureza ondulatório-corpuscular da matéria.",
      "7.4 Teoria quântica da matéria e da radiação.",
      "7.5 Modelo do átomo de hidrogênio.",
      "7.6 Núcleo atômico.",
      "7.7 Energia nuclear, relatividade geral."
    ]
  },
  {
    n: 8,
    title: "Ensino de Física.",
    subs: [
      "8.1 Conhecimento científico e habilidade didática no ensino de Física.",
      "8.2 Construção do conhecimento no ensino de Física: abordagens metodológicas.",
      "8.3 Recursos didáticos no ensino de Física (utilizados em sala de aula e laboratório, incluindo conhecimentos básicos de técnicas, materiais e normas de segurança laboratoriais)."
    ]
  },
  {
    n: 9,
    title: "O ensino de Física e as novas tecnologias da informação e comunicação.",
    subs: []
  },
  {
    n: 10,
    title: "Avaliação de aprendizagem do conhecimento científico.",
    subs: []
  },
  {
    n: 11,
    title: "Competências e habilidades propostas pelos Parâmetros Curriculares Nacionais do Ensino Médio para a disciplina de Física.",
    subs: []
  }
];

function renderTopics() {
  const container = document.getElementById("topics-list");
  if (!container) return;

  topics.forEach((topic, index) => {
    const details = document.createElement("details");
    details.className = "topic-item reveal";
    details.style.transitionDelay = (index % 6) * 0.06 + "s";

    const summary = document.createElement("summary");
    summary.className = "topic-summary";
    summary.innerHTML = `
      <span class="topic-number">${topic.n}</span>
      <span class="topic-title">${topic.title}</span>
      <span class="topic-chevron">&#8250;</span>
    `;
    details.appendChild(summary);

    if (topic.subs.length) {
      const subList = document.createElement("ul");
      subList.className = "topic-subs";
      topic.subs.forEach((sub) => {
        const li = document.createElement("li");
        li.textContent = sub;
        subList.appendChild(li);
      });
      details.appendChild(subList);
    }

    container.appendChild(details);
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
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

document.addEventListener("DOMContentLoaded", () => {
  renderTopics();
  initScrollReveal();
});
