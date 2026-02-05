export function extractCodeBlocks(text: string): string {
  const matches = text.match(/```[\s\S]*?```/g);
  return matches ? matches.join("\n\n") : text;
}

export function summarize(text: string, maxChars = 1200): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n... (truncated)";
}

export function buildPrompt(basePrompt: string, prevOutput: string | null, mode: string): string {
  if (!prevOutput) return basePrompt;

  let context = prevOutput;
  if (mode === "code_only") context = extractCodeBlocks(prevOutput);
  if (mode === "summary") context = summarize(prevOutput);

  return `${basePrompt}

---
Context from previous step:
${context}
---`;
}
