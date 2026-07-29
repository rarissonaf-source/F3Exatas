import type { Discipline, Topic } from "./types";

export const PHYSICS_TOPICS: Topic[] = [
  { slug: "cinematica", name: "Cinemática", order: 1, color: "#3b82f6" },
  { slug: "dinamica", name: "Dinâmica", order: 2, color: "#f97316" },
  { slug: "estatica", name: "Estática", order: 3, color: "#f59e0b" },
  { slug: "trabalho-energia", name: "Trabalho e Energia", order: 4, color: "#10b981" },
  { slug: "impulso-momento", name: "Impulso e Quantidade de Movimento", order: 5, color: "#14b8a6" },
  { slug: "gravitacao", name: "Gravitação", order: 6, color: "#8b5cf6" },
  { slug: "hidrostatica", name: "Hidrostática e Hidrodinâmica", order: 7, color: "#06b6d4" },
  { slug: "termologia", name: "Termologia", order: 8, color: "#f43f5e" },
  { slug: "ondulatoria", name: "Ondulatória", order: 9, color: "#6366f1" },
  { slug: "optica", name: "Óptica", order: 10, color: "#ec4899" },
  { slug: "eletrostatica", name: "Eletrostática", order: 11, color: "#a855f7" },
  { slug: "eletrodinamica", name: "Eletrodinâmica", order: 12, color: "#0ea5e9" },
  { slug: "eletromagnetismo", name: "Eletromagnetismo", order: 13, color: "#d946ef" },
  { slug: "fisica-moderna", name: "Física Moderna", order: 14, color: "#84cc16" },
];

// Taxonomia provisória (nível fundamental/técnico integrado) — ajustar assim
// que as provas reais do IFMA chegarem para conferir a categorização.
export const MATH_TOPICS: Topic[] = [
  { slug: "numeros-operacoes", name: "Números e Operações", order: 1, color: "#3b82f6" },
  { slug: "fracoes-decimais", name: "Frações e Números Decimais", order: 2, color: "#06b6d4" },
  { slug: "razao-proporcao-porcentagem", name: "Razão, Proporção e Porcentagem", order: 3, color: "#f59e0b" },
  { slug: "algebra-expressoes", name: "Álgebra e Expressões", order: 4, color: "#8b5cf6" },
  { slug: "equacoes-inequacoes", name: "Equações e Inequações", order: 5, color: "#f97316" },
  { slug: "sistemas-equacoes", name: "Sistemas de Equações", order: 6, color: "#10b981" },
  { slug: "funcoes", name: "Funções", order: 7, color: "#6366f1" },
  { slug: "geometria-plana", name: "Geometria Plana", order: 8, color: "#ec4899" },
  { slug: "geometria-espacial", name: "Geometria Espacial", order: 9, color: "#14b8a6" },
  { slug: "trigonometria", name: "Trigonometria", order: 10, color: "#84cc16" },
  { slug: "estatistica-probabilidade", name: "Estatística e Probabilidade", order: 11, color: "#a855f7" },
  { slug: "matematica-financeira", name: "Matemática Financeira", order: 12, color: "#0ea5e9" },
];

export const TOPICS_BY_DISCIPLINE: Record<Discipline, Topic[]> = {
  fisica: PHYSICS_TOPICS,
  matematica: MATH_TOPICS,
};

export function getTopicsForDiscipline(discipline: string): Topic[] {
  return TOPICS_BY_DISCIPLINE[discipline as Discipline] ?? [];
}
