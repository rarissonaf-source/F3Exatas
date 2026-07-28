import katex from "katex";

function renderMath(expr: string): string {
  try {
    return katex.renderToString(expr, { throwOnError: false, output: "html" });
  } catch {
    return expr;
  }
}

export function LatexText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\$([^$]+)\$/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part) }} />
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
