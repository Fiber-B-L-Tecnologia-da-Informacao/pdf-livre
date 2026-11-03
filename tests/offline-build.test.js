import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

// This regression checks the actual shipping file, not a separate test template.
test('standalone build embeds scripts, fonts, CMaps, licenses and enforced script hashes', () => {
  execFileSync(process.execPath, ['scripts/build-offline.mjs'], { stdio: 'pipe' });
  const html = readFileSync('dist/pdf-livre.html', 'utf8');
  assert.doesNotMatch(html, /<(?:script|link|img|iframe)\b[^>]*(?:src|href)="(?!data:|blob:)[^"]+"/i);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /worker-src blob:/);
  assert.match(html, /MIT License/);
  assert.match(html, /Apache License/);
  assert.match(html, /Licenças e créditos/);
  const scripts = [...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert.equal(scripts.length, 2);
  for (const script of scripts) {
    const hash = createHash('sha256').update(script).digest('base64');
    assert.ok(html.includes(`'sha256-${hash}'`));
  }
  for (const dir of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
    for (const name of readdirSync(`vendor/${dir}`)) assert.ok(html.includes(`${dir}/${name}`), `${dir}/${name} embedded`);
  }
  const expected = createHash('sha256').update(html).digest('hex');
  assert.equal(readFileSync('dist/SHA256SUMS.txt', 'utf8'), `${expected}  pdf-livre.html\n`);
});
