import { extractPage, inspectText, pageBlock, verifySequence, safeBaseName, splitParts, buildReport } from './converter.js';

function checkCancelled(signal) {
  if (signal?.aborted) throw new DOMException('Conversão cancelada.', 'AbortError');
}

/** Converts locally. Injecting the reader keeps orchestration independently testable. */
export async function convertFile(file, { reader, zipClass, split = false, pagesPerPart = 300, cleanStamps = false, signal, onProgress = () => {} }) {
  checkCancelled(signal);
  const started = performance.now();
  const source = { name: file.name, data: new Uint8Array(await file.arrayBuffer()) };
  checkCancelled(signal);
  const loading = reader.getDocument({
    data: source.data, disableFontFace: true, isEvalSupported: false,
    cMapUrl: new URL('../vendor/cmaps/', import.meta.url).href,
    cMapPacked: true, standardFontDataUrl: new URL('../vendor/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('../vendor/wasm/', import.meta.url).href,
    iccUrl: new URL('../vendor/iccs/', import.meta.url).href,
    useSystemFonts: false,
  });
  let abortCleanup;
  const abort = () => { abortCleanup = Promise.resolve(loading.destroy()).catch(() => {}); };
  signal?.addEventListener('abort', abort, { once: true });
  // Cover cancellation between the preflight and listener registration.
  if (signal?.aborted) abort();
  try {
    const document = await loading.promise;
    checkCancelled(signal);
    const total = document.numPages;
    if (!Number.isSafeInteger(total) || total < 1) throw new Error('O PDF não contém páginas válidas.');
    const blocks = [], removed = [], emptyPages = [], lowTextPages = [], errorPages = [], securityFindings = [];
    for (let n = 1; n <= total; n++) {
      checkCancelled(signal);
      let page;
      try {
        page = await document.getPage(n);
        const content = await page.getTextContent();
        // Inspect original extracted items before optional cleaning.
        for (const finding of inspectText(content.items.map(item => item.str || '').join('\n'))) {
          securityFindings.push({ page: n, ...finding });
        }
        const result = extractPage(content, { cleanStamps });
        removed.push(...result.removed.map(item => ({ page: n, ...item })));
        if (result.empty) emptyPages.push(n);
        else if (result.lowText) lowTextPages.push(n);
        blocks.push(pageBlock(n, result.text));
      } catch (error) {
        checkCancelled(signal);
        errorPages.push(n);
        blocks.push(pageBlock(n, '', { error: true }));
      } finally { try { page?.cleanup(); } catch { /* Best-effort per-page cleanup. */ } }
      onProgress({ phase: 'pages', current: n, total, percent: n / total * 100 });
      if (n % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      if (n % 200 === 0) await document.cleanup();
    }
    checkCancelled(signal);
    if (!verifySequence(blocks, total)) throw new Error('Falha na sequência das páginas. Nenhum arquivo foi disponibilizado.');
    const base = safeBaseName(source.name);
    const report = buildReport({ fileName: source.name, total, removed, emptyPages, lowTextPages, errorPages, securityFindings, durationSeconds: (performance.now() - started) / 1000, cleanStamps });
    let blob, name, partCount = 1;
    if (split) {
      if (!zipClass) throw new Error('A biblioteca de compactação não carregou.');
      const zip = new zipClass();
      const parts = splitParts(blocks, base, pagesPerPart);
      partCount = parts.length;
      for (const part of parts) zip.file(part.name, part.text);
      zip.file('_relatorio_de_conferencia.txt', report);
      blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 } }, meta => {
        onProgress({ phase: 'zip', percent: meta.percent, current: total, total });
      });
      name = `${base}_markdown.zip`;
    } else {
      blob = new Blob([`# ${base}\n\nPáginas: ${total}\n\n`, ...blocks], { type: 'text/markdown;charset=utf-8' });
      name = `${base}.md`;
    }
    checkCancelled(signal);
    return { blob, name, report, reportName: `${base}_relatorio_de_conferencia.txt`, total, partCount, emptyPages, lowTextPages, errorPages, removed, securityFindings };
  } catch (error) {
    checkCancelled(signal);
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
    try { await loading.destroy(); } catch { /* Retain the original conversion error. */ }
    await abortCleanup;
  }
}
