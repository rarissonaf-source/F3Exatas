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

function convertMath(expr: string): string {
  let s = expr;
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  // numeric super/subscripts get real Unicode glyphs; non-numeric (letter)
  // subscripts like F_S or d_A have no Unicode equivalent — Unicode has no
  // subscript uppercase letters at all, in any font — so keep the underscore.
  s = s.replace(/\^\{(-?\d+)\}/g, (_, d) => toSup(d));
  s = s.replace(/\^(-?\d)/g, (_, d) => toSup(d));
  s = s.replace(/_\{(-?\d+)\}/g, (_, d) => toSub(d));
  s = s.replace(/_(-?\d)/g, (_, d) => toSub(d));
  s = s.replace(/\\pi/g, "π");
  s = s.replace(/\\Omega/g, "Ω");
  s = s.replace(/\\Phi/g, "Φ");
  s = s.replace(/\\alpha/g, "α");
  s = s.replace(/\\beta/g, "β");
  s = s.replace(/\\theta/g, "θ");
  s = s.replace(/\\Delta/g, "Δ");
  s = s.replace(/\\mu/g, "μ");
  s = s.replace(/\\rho/g, "ρ");
  s = s.replace(/\\varepsilon/g, "ε");
  s = s.replace(/\\arcsen/g, "arcsen");
  s = s.replace(/\\rightarrow/g, "→");
  s = s.replace(/\\times/g, "×");
  s = s.replace(/\\cdot/g, "·");
  s = s.replace(/\\ /g, " ");
  s = s.replace(/\\,/g, " ");
  return s;
}

export function latexToPlainText(input: string): string {
  return input.replace(/\$([^$]+)\$/g, (_, expr) => convertMath(expr));
}
