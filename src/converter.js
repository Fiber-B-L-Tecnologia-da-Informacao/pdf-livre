/** Pure conversion helpers. PDF parsing and downloads stay in the browser adapter. */
const STAMP_PATTERNS = [
  /^Este documento é cópia do original/i,
  /^Para conferir o original,? acesse/i,
  /^Assinado eletronicamente por:/i,
  /^Documento assinado eletronicamente por/i,
  /^Número do documento:\s*\d/i,
  /^https?:\/\/pje[\w.-]*\.jus\.br\/\S*$/i,
  /^Num\.\s*\d+\s*-\s*Pág\.\s*\d+$/i,
];

const compactLength = (text) => text.replace(/\s/gu, "").length;

export function inspectText(text) {
  const rules = [
    ["caractere invisível ou direcional", /[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/gu],
    ["possível instrução dirigida a uma IA", /(?:ignore|disregard)\s+(?:(?:all|previous|prior|the)\s+){0,3}(?:instructions|prompts)|(?:ignore|desconsidere)\s+(?:(?:todas|as|instruções|anteriores|prévias)\s*){1,5}|system\s+prompt|developer\s+message/giu],
  ];
  const findings = [];
  for (const [kind, pattern] of rules) {
    for (const match of String(text).matchAll(pattern)) {
      const start = Math.max(0, match.index - 45);
      const end = Math.min(text.length, match.index + match[0].length + 70);
      findings.push({ kind, excerpt: text.slice(start, end) });
    }
  }
  return findings;
}

export function extractPage(textContent, { cleanStamps = false } = {}) {
  const lines = [];
  let line = null;
  const flush = () => {
    if (line && line.text.trim()) lines.push(line);
    line = null;
  };
  for (const item of textContent.items ?? []) {
    if (typeof item.str !== "string") continue;
    const transform = item.transform ?? [1, 0, 0, 1, 0, 0];
    const [a, b, c, d, x, y] = transform;
    const horizontal = Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && a > 0;
    const height = Math.abs(item.height || d || a || 10);
    if (line && (horizontal !== line.horizontal || Math.abs(y - line.y) > Math.max(2, Math.min(height, line.height) * 0.5))) flush();
    if (!line) line = { text: "", y, height, horizontal, endX: null };
    // A geometric gap represents whitespace even when the PDF has no space glyph.
    const gap = line.endX === null ? 0 : x - line.endX;
    if (horizontal && gap > Math.max(1, height * 0.15) && line.text && !/\s$/u.test(line.text) && item.str && !/^\s/u.test(item.str)) line.text += " ";
    line.text += item.str;
    line.endX = x + Math.abs(item.width || 0);
    if (item.hasEOL) flush();
  }
  flush();

  const totalCharacters = lines.reduce((sum, entry) => sum + compactLength(entry.text), 0);
  const rotatedCharacters = lines.filter((entry) => !entry.horizontal).reduce((sum, entry) => sum + compactLength(entry.text), 0);
  const removeRotated = cleanStamps && totalCharacters > 0 && rotatedCharacters / totalCharacters <= 0.5;
  const removed = [];
  const kept = [];
  for (const entry of lines) {
    const text = entry.text.trim();
    if (removeRotated && !entry.horizontal) {
      removed.push({ reason: "possível carimbo lateral (heurística)", text });
    } else if (cleanStamps && STAMP_PATTERNS.some((pattern) => pattern.test(text))) {
      removed.push({ reason: "possível assinatura ou rodapé (heurística)", text });
    } else {
      kept.push({ ...entry, text });
    }
  }
  let text = "";
  for (let index = 0; index < kept.length; index += 1) {
    const current = kept[index];
    const previous = kept[index - 1];
    if (previous) {
      const gap = previous.y - current.y;
      text += previous.horizontal && current.horizontal && (gap > previous.height * 1.8 || gap < -previous.height) ? "\n\n" : "\n";
    }
    text += current.text;
  }
  const count = compactLength(text);
  return { text, removed, lowText: count > 0 && count < 20, empty: count === 0 };
}

export function pageBlock(pageNumber, text, { error = false } = {}) {
  if (!Number.isInteger(pageNumber) || pageNumber < 1) throw new RangeError("Número de página inválido.");
  const content = error
    ? "*[Erro ao ler esta página. Verifique o PDF original.]*"
    : String(text).trim() || "*[Página sem texto extraível; pode estar vazia ou exigir OCR.]*";
  return `## Página ${pageNumber}\n\n${content}\n\n`;
}

export function verifySequence(blocks, total) {
  return Number.isInteger(total) && total > 0 && Array.isArray(blocks) && blocks.length === total && Array.from({ length: total }, (_, index) => typeof blocks[index] === "string" && blocks[index].startsWith(`## Página ${index + 1}\n\n`)).every(Boolean);
}

export function safeBaseName(name) {
  return String(name).replace(/\.pdf$/iu, "").replace(/[\\/:*?"<>|\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/gu, "_").replace(/^\.+|[. ]+$/gu, "").trim() || "documento";
}

export function splitParts(blocks, base, pagesPerPart) {
  if (!verifySequence(blocks, blocks.length)) throw new Error("Sequência de páginas inválida.");
  if (!Number.isInteger(pagesPerPart) || pagesPerPart < 1 || pagesPerPart > 5000) throw new RangeError("Escolha de 1 a 5.000 páginas por parte.");
  const totalParts = Math.ceil(blocks.length / pagesPerPart);
  const digits = Math.max(5, String(blocks.length).length);
  const partDigits = Math.max(3, String(totalParts).length);
  const safe = safeBaseName(base);
  return Array.from({ length: totalParts }, (_, index) => {
    const from = index * pagesPerPart + 1;
    const to = Math.min((index + 1) * pagesPerPart, blocks.length);
    return {
      name: `${safe}_parte_${String(index + 1).padStart(partDigits, "0")}_pag_${String(from).padStart(digits, "0")}_a_${String(to).padStart(digits, "0")}.md`,
      text: `# ${safe}\n\nParte ${index + 1} de ${totalParts}: páginas ${from} a ${to} de ${blocks.length}\n\n${blocks.slice(from - 1, to).join("")}`,
      from,
      to,
    };
  });
}

export function buildReport({ fileName, total, removed = [], emptyPages = [], lowTextPages = [], errorPages = [], securityFindings = [], durationSeconds = 0, cleanStamps = false }) {
  const lines = [
    "RELATÓRIO DE CONFERÊNCIA — PDF LIVRE", "",
    `Arquivo de origem: ${fileName}`,
    `Total de páginas: ${total}`,
    `Limpeza heurística de carimbos: ${cleanStamps ? "ativada" : "desativada; texto preservado"}`,
    `Trechos removidos: ${removed.length}`,
    `Páginas sem texto extraível: ${emptyPages.length}`,
    `Páginas com pouco texto: ${lowTextPages.length}`,
    `Páginas com erro de leitura: ${errorPages.length}`,
    `Tempo de conversão: ${Math.max(0, Math.round(durationSeconds))} s`, "",
    "A conferência verifica a sequência dos blocos, não a fidelidade integral ao PDF.",
    "Uma página sem texto pode estar vazia ou exigir OCR. Pouco texto não comprova necessidade de OCR.", "",
  ];
  for (const [title, pages] of [["PÁGINAS SEM TEXTO EXTRAÍVEL", emptyPages], ["PÁGINAS COM POUCO TEXTO", lowTextPages], ["PÁGINAS COM ERRO", errorPages]]) {
    if (pages.length) lines.push(title, pages.join(", "), "");
  }
  lines.push("TEXTO REMOVIDO — confira no original");
  if (!removed.length) lines.push("Nenhum trecho removido.");
  for (const item of removed) lines.push(`Página ${item.page ?? item.pageNumber ?? "não informada"} (${item.reason}): ${item.text}`);
  lines.push("", "SINAIS DE SEGURANÇA NO TEXTO EXTRAÍDO", "Heurística limitada: não detecta todos os ataques, texto oculto, fontes ou camadas. Confira visualmente o PDF.");
  if (!securityFindings.length) lines.push("Nenhum sinal encontrado pelas verificações textuais aplicadas.");
  for (const item of securityFindings) lines.push(`Página ${item.page ?? item.pageNumber ?? "não informada"} (${item.kind}): ${item.excerpt}`);
  return `${lines.join("\n")}\n`;
}
