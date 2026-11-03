/** Synthetic, non-personal PDF. Generated in memory; no real documents are stored. */
export function samplePdf(pageCount = 3) {
  const objects = new Map();
  const pageIds = Array.from({ length: pageCount }, (_, i) => 4 + i * 2);
  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objects.set(2, `<< /Type /Pages /Count ${pageCount} /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] >>`);
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  for (let i = 0; i < pageCount; i++) {
    const id = pageIds[i];
    const stream = i === 1 ? '' : `BT /F1 12 Tf 50 750 Td (PDF Livre - p\\341gina ${i + 1}: convers\\343o local com acentos.) Tj ET\n`;
    objects.set(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id + 1} 0 R >>`);
    objects.set(id + 1, `<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  }
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id <= objects.size; id++) { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${objects.get(id)}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.size + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= objects.size; id++) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.size + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
