import { build, transform } from 'esbuild';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');
const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const assets = {};
const notices = [['LICENSE', await read('LICENSE')], ['THIRD_PARTY_NOTICES.md', await read('THIRD_PARTY_NOTICES.md')]];
for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  for (const name of (await readdir(join(root, 'vendor', directory))).sort()) {
    const path = `vendor/${directory}/${name}`;
    const bytes = await readFile(join(root, path));
    assets[`${directory}/${name}`] = bytes.toString('base64');
    if (/license|notice|copying/i.test(name)) notices.push([`${directory}/${name}`, bytes.toString('utf8')]);
  }
}
for (const name of ['PDFJS-LICENSE', 'JSZIP-LICENSE.md']) notices.push([name, await read(`vendor/${name}`)]);
const worker = await transform(await read('vendor/pdf.worker.mjs'), {
  loader: 'js', format: 'esm', minify: true, target: 'es2024', legalComments: 'inline',
});
const result = await build({
  absWorkingDir: root, entryPoints: ['src/app.js'], bundle: true, write: false,
  platform: 'browser', format: 'esm', target: 'es2024', minify: true,
  legalComments: 'inline', metafile: true,
  plugins: [{
    name: 'embed-pdf-resources',
    setup(builder) {
      builder.onLoad({ filter: /[/\\]src[/\\]embedded-assets\.js$/ }, () => ({
        contents: `export const assets = ${JSON.stringify(assets)}; export const workerSource = ${JSON.stringify(worker.code)};`,
        loader: 'js',
      }));
    },
  }],
});
if (Object.values(result.metafile.outputs).some(output => output.imports.some(item => item.external))) {
  throw new Error('O pacote offline contém imports externos.');
}
// Esbuild's browser output escapes HTML closing tags inside literals.
const appScript = result.outputFiles[0].text;
if (/<\/script/i.test(appScript)) throw new Error('Fechamento de script inseguro no pacote.');
const zipScript = (await read('vendor/jszip.min.js')).replaceAll('</script', '<\\/script');
const styles = await read('src/styles.css');
const hash = script => `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
const csp = `default-src 'none'; script-src ${hash(zipScript)} ${hash(appScript)} blob: 'wasm-unsafe-eval'; style-src 'unsafe-inline'; worker-src blob:; connect-src 'none'; img-src data: blob:; object-src 'none'; base-uri 'none'; form-action 'none'`;
let html = await read('index.html');
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]+>/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`)
  .replace('<link rel="stylesheet" href="./src/styles.css">', `<style>\n${styles}\n</style>`)
  .replace('href="./assets/favicon.svg"', `href="data:image/svg+xml;base64,${(await readFile(join(root, 'assets/favicon.svg'))).toString('base64')}"`)
  .replace('<script defer src="./vendor/jszip.min.js"></script>', () => `<script>${zipScript}</script>`)
  .replace('<script type="module" src="./src/app.js"></script>', () => `<script type="module">${appScript}</script>`)
  .replace('</footer>', '</footer>\n<details class="licencas"><summary>Licenças e créditos do código aberto</summary>' + notices.map(([name, text]) => `<h3>${escapeHtml(name)}</h3><pre>${escapeHtml(text)}</pre>`).join('\n') + '</details>');
// Assert the HTML never needs a sibling script, stylesheet, image or frame.
if (/<(?:script|link|img|iframe)\b[^>]*(?:src|href)="(?!data:|blob:)[^"]+"/i.test(html)) {
  throw new Error('O HTML offline ainda referencia arquivos externos.');
}
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/pdf-livre.html'), html);
await writeFile(join(root, 'dist/SHA256SUMS.txt'), `${createHash('sha256').update(html).digest('hex')}  pdf-livre.html\n`);
console.log(`HTML offline completo: dist/pdf-livre.html (${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB).`);
