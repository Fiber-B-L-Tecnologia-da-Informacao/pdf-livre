import test from 'node:test';
import assert from 'node:assert/strict';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { samplePdf } from './fixture.js';
import { extractPage, pageBlock, verifySequence } from '../src/converter.js';

test('real PDF.js reads synthetic pages, accents and an empty page in order', async () => {
  const loading = pdfjs.getDocument({ data: samplePdf(), isEvalSupported: false, useSystemFonts: true });
  try {
    const doc = await loading.promise;
    assert.equal(doc.numPages, 3);
    const blocks = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const r = extractPage(await page.getTextContent());
      blocks.push(pageBlock(n, r.text));
      if (n === 2) assert.equal(r.empty, true);
      else assert.match(r.text, new RegExp(`página ${n}: conversão local com acentos`));
      page.cleanup();
    }
    assert.equal(verifySequence(blocks, 3), true);
  } finally { await loading.destroy(); }
});
