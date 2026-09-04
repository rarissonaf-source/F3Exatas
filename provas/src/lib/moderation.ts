// Lista simples de termos ofensivos: discurso de ódio (racismo, homofobia,
// machismo e afins), palavrões e xingamentos genéricos. É uma primeira
// barreira, não perfeita — dá pra editar livremente pra adicionar/remover
// termos conforme necessário.
const BLOCKED_TERMS = [
  // racismo
  "crioulo",
  "crioula",
  "macaco",
  "macaca",
  "neguinho",
  "negrinho",
  "tição",
  "cabelo de bombril",
  // homofobia / transfobia
  "viado",
  "viadinho",
  "bichinha",
  "sapatao",
  "traveco",
  "boiola",
  // machismo / misoginia
  "vadia",
  "piranha",
  "vagabunda",
  "vaca sem vergonha",
  "mulher tinha que",
  "lugar de mulher",
  // xenofobia / antissemitismo / capacitismo
  "judeu safado",
  "arabe terrorista",
  "retardado",
  "retardada",
  "aleijado",
  "mongoloide",
  // ameaças/ódio genéricos
  "deveria morrer",
  "deveriam morrer",
  "merece morrer",
  "merecem morrer",
  "deveria ser exterminado",
  "deveriam ser exterminados",
  // palavrões / vulgaridade
  "merda",
  "bosta",
  "porra",
  "caralho",
  "cacete",
  "puta que pariu",
  "foda-se",
  "fodase",
  "vai se foder",
  "vai tomar no cu",
  "tomar no cu",
  "arrombado",
  "arrombada",
  "cuzao",
  "cuzona",
  "desgraca",
  "maldito",
  "maldita",
  "praga",
  // xingamentos / insultos genéricos
  "idiota",
  "imbecil",
  "otario",
  "otaria",
  "babaca",
  "escroto",
  "escrota",
  "corno",
  "corna",
  "safado",
  "safada",
  "vagabundo",
  "canalha",
  "verme",
  "lixo humano",
  "seu lixo",
  "sua lixa",
  "seu burro",
  "sua burra",
  "desgracado",
  "desgracada",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/(.)\1{2,}/g, "$1"); // "vadiaaaa" -> "vadia"
}

export function isOffensive(text: string): boolean {
  const normalized = normalize(text);
  return BLOCKED_TERMS.some((term) => normalized.includes(normalize(term)));
}
