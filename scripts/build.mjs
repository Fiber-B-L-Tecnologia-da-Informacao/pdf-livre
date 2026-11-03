import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import './prepare-vendor.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
for (const name of ['index.html', 'src', 'assets', 'vendor', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  await cp(`${root}${name}`, `${root}dist/${name}`, { recursive: true });
}
await import('./build-offline.mjs');
console.log('Distribuições estática e HTML único completas em dist/.');
