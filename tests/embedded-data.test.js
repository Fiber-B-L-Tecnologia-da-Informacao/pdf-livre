import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedDataFactory } from '../src/embedded-data.js';

test('embedded PDF data returns exact independent buffers for fonts and CMaps', async () => {
  const Factory = embeddedDataFactory({ 'cmaps/test.bcmap': 'AAEC/w==', 'standard_fonts/test.pfb': 'AwQF' });
  const reader = new Factory();
  const first = await reader.fetch({ kind: 'cMapUrl', filename: 'test.bcmap' });
  const second = await reader.fetch({ kind: 'cMapUrl', filename: 'test.bcmap' });
  assert.deepEqual([...first], [0, 1, 2, 255]);
  first[0] = 99;
  assert.equal(second[0], 0);
  assert.deepEqual([...await reader.fetch({ kind: 'standardFontDataUrl', filename: 'test.pfb' })], [3, 4, 5]);
});

test('embedded resources reject missing files, traversal and unknown asset kinds', async () => {
  const Factory = embeddedDataFactory({});
  const reader = new Factory();
  for (const input of [
    { kind: 'cMapUrl', filename: '../font' },
    { kind: 'cMapUrl', filename: '..\\font' },
    { kind: 'remoteUrl', filename: 'file' },
    { kind: 'cMapUrl', filename: 'absent.bcmap' },
  ]) await assert.rejects(reader.fetch(input));
});
