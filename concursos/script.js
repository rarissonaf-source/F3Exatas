// Cada área é um produto separado: quem compra só essa área tem acesso só a
// ela; quem compra o pacote completo (vendido fora do portal, por enquanto)
// tem acesso a todas. Dentro de cada área pode haver mais de um PDF (teoria,
// exercícios comentados, etc.) — por isso o botão daqui não baixa nada direto,
// só sinaliza que o material está disponível para aquisição.
const topics = [
  {
    slug: "cinematica",
    name: "Cinemática",
    subs: [
      "Movimento uniforme (MU) e movimento uniformemente variado (MUV)",
      "Queda livre e lançamento vertical",
      "Lançamento horizontal e lançamento oblíquo",
      "Movimento circular uniforme",
    ],
  },
  {
    slug: "dinamica",
    name: "Dinâmica",
    subs: [
      "Leis de Newton e suas aplicações",
      "Força de atrito (estático e cinético)",
      "Sistemas de blocos, planos inclinados e polias",
      "Dinâmica do movimento circular",
    ],
  },
  {
    slug: "estatica",
    name: "Estática",
    subs: [
      "Equilíbrio de um ponto material e de corpos rígidos",
      "Momento de uma força (torque)",
      "Centro de massa e centro de gravidade",
      "Alavancas e máquinas simples",
    ],
  },
  {
    slug: "trabalho-energia",
    name: "Trabalho e Energia",
    subs: [
      "Trabalho de uma força constante e variável",
      "Energia cinética e energia potencial (gravitacional e elástica)",
      "Conservação da energia mecânica",
      "Potência",
    ],
  },
  {
    slug: "impulso-momento",
    name: "Impulso e Quantidade de Movimento",
    subs: [
      "Impulso de uma força",
      "Conservação da quantidade de movimento",
      "Colisões elásticas, inelásticas e perfeitamente inelásticas",
    ],
  },
  {
    slug: "gravitacao",
    name: "Gravitação",
    subs: [
      "Leis de Kepler",
      "Lei da gravitação universal de Newton",
      "Órbitas, satélites e velocidade de escape",
    ],
  },
  {
    slug: "hidrostatica",
    name: "Hidrostática e Hidrodinâmica",
    subs: [
      "Pressão, densidade e Teorema de Stevin",
      "Princípio de Pascal",
      "Princípio de Arquimedes (empuxo)",
      "Equação da continuidade e Teorema de Bernoulli",
    ],
  },
  {
    slug: "termologia",
    name: "Termologia",
    subs: [
      "Temperatura, escalas termométricas e dilatação térmica",
      "Calorimetria e trocas de calor",
      "Mudanças de estado físico e diagramas de fase",
      "Estudo dos gases e transformações gasosas",
      "Leis da termodinâmica, entropia e máquinas térmicas",
    ],
  },
  {
    slug: "ondulatoria",
    name: "Ondulatória",
    subs: [
      "Movimento harmônico simples (MHS)",
      "Classificação e características das ondas",
      "Ondas sonoras: timbre, altura e intensidade",
      "Reflexão, refração, interferência, difração e ressonância",
    ],
  },
  {
    slug: "optica",
    name: "Óptica",
    subs: [
      "Reflexão da luz e espelhos planos e esféricos",
      "Refração da luz e Lei de Snell",
      "Lentes esféricas e instrumentos ópticos",
      "Óptica da visão",
    ],
  },
  {
    slug: "eletrostatica",
    name: "Eletrostática",
    subs: [
      "Carga elétrica e processos de eletrização",
      "Lei de Coulomb",
      "Campo elétrico e potencial elétrico",
      "Capacitores e associação de capacitores",
    ],
  },
  {
    slug: "eletrodinamica",
    name: "Eletrodinâmica",
    subs: [
      "Corrente elétrica e Leis de Ohm",
      "Resistores e associação de resistores",
      "Potência elétrica e efeito Joule",
      "Circuitos elétricos e geradores/receptores",
    ],
  },
  {
    slug: "eletromagnetismo",
    name: "Eletromagnetismo",
    subs: [
      "Campo magnético e força magnética sobre cargas e correntes",
      "Lei de Ampère",
      "Indução eletromagnética e Lei de Faraday",
      "Equações de Maxwell",
    ],
  },
  {
    slug: "fisica-moderna",
    name: "Física Moderna",
    subs: [
      "Relatividade restrita e transformações de Lorentz",
      "Efeito fotoelétrico e dualidade onda-partícula",
      "Modelo atômico e física quântica",
      "Física nuclear e radioatividade",
    ],
  },
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
      <span class="topic-number">${index + 1}</span>
      <span class="topic-title">${topic.name}</span>
      <span class="topic-chevron">&#8250;</span>
    `;
    details.appendChild(summary);

    const subList = document.createElement("ul");
    subList.className = "topic-subs";
    topic.subs.forEach((sub) => {
      const li = document.createElement("li");
      li.textContent = sub;
      subList.appendChild(li);
    });
    details.appendChild(subList);

    const materialsCta = document.createElement("div");
    materialsCta.className = "topic-materials-cta";
    materialsCta.innerHTML = `
      <span class="topic-materials-label">Material em PDF desta área</span>
      <span class="topic-materials-badge">Em breve</span>
    `;
    details.appendChild(materialsCta);

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
