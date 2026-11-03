import { cp, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const vendor = `${root}vendor/`;
await mkdir(vendor, { recursive: true });
const pdf = `${root}node_modules/pdfjs-dist/`;
for (const name of ['pdf.mjs', 'pdf.worker.mjs']) {
  await copyFile(`${pdf}build/${name}`, `${vendor}${name}`);
}
for (const name of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  await cp(`${pdf}${name}`, `${vendor}${name}`, { recursive: true });
}
await copyFile(`${root}node_modules/jszip/dist/jszip.min.js`, `${vendor}jszip.min.js`);
await copyFile(`${pdf}LICENSE`, `${vendor}PDFJS-LICENSE`);
await copyFile(`${root}node_modules/jszip/LICENSE.markdown`, `${vendor}JSZIP-LICENSE.md`);
console.log('Bibliotecas preparadas localmente, sem CDN.');
