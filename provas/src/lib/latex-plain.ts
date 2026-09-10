// Converts our lightweight inline-LaTeX ($...$) into readable plain text
// with real Unicode super/subscripts, Greek letters and math symbols.
// Used only for the downloadable practice PDF, where @react-pdf/renderer
// can't interpret LaTeX/KaTeX directly. Not meant to be typeset-perfect —
// just legible enough for someone solving the problem on paper.
//
// The PDF font must be a Unicode-complete face (DejaVu Sans is registered
// in the PDF route) — the standard Helvetica/WinAnsi font does NOT cover
// the superscript/subscript blocks or Greek letters and renders them as
// broken glyphs.

const SUP_DIGITS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};
const SUB_DIGITS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "-": "₋",
};

function toSup(s: string) {
  return [...s].map((c) => SUP_DIGITS[c] ?? c).join("");
}
function toSub(s: string) {
  return [...s].map((c) => SUB_DIGITS[c] ?? c).join("");
}

// Letras gregas, minúsculas e maiúsculas — cobre bem mais do que só as que
// apareciam nas primeiras questões revisadas manualmente.
const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε",
  zeta: "ζ", eta: "η", theta: "θ", vartheta: "θ", iota: "ι", kappa: "κ",
  lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", varrho: "ρ",
  sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", varphi: "φ", chi: "χ",
  psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π",
  Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

// Nomes de função que em LaTeX vêm com barra (\cos, \sen) só pra ficarem
// retos no modo matemático — em texto puro basta remover a barra.
const FUNCTION_NAMES = [
  "cos", "sen", "sin", "tg", "tan", "cotg", "cot", "cosec", "csc", "sec",
  "log", "ln", "arcsen", "arccos", "arctan", "arctg",
];

// Conjuntos numéricos com letra vazada (\mathbb{N} etc.).
const BLACKBOARD: Record<string, string> = {
  N: "ℕ", Z: "ℤ", Q: "ℚ", R: "ℝ", C: "ℂ",
};

// Outros símbolos e comandos de conjunto/lógica comuns nas questões.
const SYMBOLS: Record<string, string> = {
  ldots: "…", cdots: "…", dots: "…",
  cap: "∩", cup: "∪", in: "∈", notin: "∉",
  subset: "⊂", subseteq: "⊆", supset: "⊃", supseteq: "⊇",
  forall: "∀", exists: "∃", emptyset: "∅", varnothing: "∅",
  wedge: "∧", vee: "∨", lnot: "¬", neg: "¬",
  Rightarrow: "⇒", Leftrightarrow: "⇔", leftrightarrow: "↔",
};

// Marcadores temporários pras chaves de notação de conjunto (\{ \}), que
// precisam sobreviver à limpeza de chaves de agrupamento puro do LaTeX
// (\frac{...}, \text{...} etc.) mais abaixo nessa função. Usa caracteres da
// área de uso privado do Unicode — nunca aparecem em conteúdo real.
const OPEN_BRACE_MARKER = "";
const CLOSE_BRACE_MARKER = "";

function convertMath(expr: string): string {
  let s = expr;
  s = s.replace(/\\\{/g, OPEN_BRACE_MARKER);
  s = s.replace(/\\\}/g, CLOSE_BRACE_MARKER);
  // \text{...} e \mathrm{...} só existem pra tipografia — mantém o conteúdo.
  s = s.replace(/\\(?:text|mathrm|textrm|operatorname)\{([^{}]*)\}/g, "$1");
  s = s.replace(/\\mathbb\{([A-Z])\}/g, (_, letter) => BLACKBOARD[letter] ?? letter);
  s = s.replace(/\\(?:frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  // \sqrt sem chaves (\sqrt2, \sqrt3) só aplica à próxima letra/dígito.
  s = s.replace(/\\sqrt\s*(\d+|[a-zA-Zθπ])/g, "√$1");
  // numeric super/subscripts get real Unicode glyphs; non-numeric (letter)
  // subscripts like F_S or d_A have no Unicode equivalent — Unicode has no
  // subscript uppercase letters at all, in any font — so keep the underscore.
  s = s.replace(/\^\{(-?\d+)\}/g, (_, d) => toSup(d));
  s = s.replace(/\^(-?\d)/g, (_, d) => toSup(d));
  s = s.replace(/_\{(-?\d+)\}/g, (_, d) => toSub(d));
  s = s.replace(/_(-?\d)/g, (_, d) => toSub(d));
  s = s.replace(/\\rightarrow/g, "→");
  s = s.replace(/\\leftarrow/g, "←");
  s = s.replace(/\\times/g, "×");
  s = s.replace(/\\div/g, "÷");
  s = s.replace(/\\cdot/g, "·");
  s = s.replace(/\\pm/g, "±");
  s = s.replace(/\\leq/g, "≤");
  s = s.replace(/\\geq/g, "≥");
  s = s.replace(/\\neq/g, "≠");
  s = s.replace(/\\approx/g, "≈");
  s = s.replace(/\\infty/g, "∞");
  s = s.replace(/\\perp/g, "⊥");
  s = s.replace(/\\parallel/g, "∥");
  s = s.replace(/\\circ/g, "°");
  s = s.replace(/\\%/g, "%");
  // Letras gregas, símbolos de conjunto/lógica e nomes de função — depois dos
  // símbolos acima, pra não confundir prefixos (\phi com \pm, por exemplo).
  s = s.replace(/\\([A-Za-z]+)/g, (match, word) => {
    if (GREEK[word]) return GREEK[word];
    if (SYMBOLS[word]) return SYMBOLS[word];
    if (FUNCTION_NAMES.includes(word)) return word;
    return match;
  });
  s = s.replace(/\\ /g, " ");
  s = s.replace(/\\,/g, " ");
  s = s.replace(/\\;/g, " ");
  // Sobra de chaves de agrupamento puro (ex.: {3x+2}) sem comando na frente.
  s = s.replace(/\{([^{}]*)\}/g, "$1");
  // Comando LaTeX desconhecido que ainda sobrou — melhor tirar só a barra do
  // que mostrar o comando cru.
  s = s.replace(/\\([A-Za-z]+)/g, "$1");
  // Restaura as chaves literais de notação de conjunto.
  s = s.split(OPEN_BRACE_MARKER).join("{");
  s = s.split(CLOSE_BRACE_MARKER).join("}");
  return s;
}

export function latexToPlainText(input: string): string {
  return input.replace(/\$([^$]+)\$/g, (_, expr) => convertMath(expr));
}
