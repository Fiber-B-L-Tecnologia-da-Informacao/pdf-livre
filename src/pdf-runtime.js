import * as pdfjs from '../vendor/pdf.mjs';
import { assets, workerSource } from './embedded-assets.js';
import { embeddedDataFactory } from './embedded-data.js';

const offline = assets !== null;
let workerUrl;
if (offline) {
  workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  window.addEventListener('pagehide', event => {
    if (!event.persisted) URL.revokeObjectURL(workerUrl);
  });
} else {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.mjs', import.meta.url).href;
}
const BinaryDataFactory = offline ? embeddedDataFactory(assets) : null;
export function getDocument(options) {
  return pdfjs.getDocument(offline ? {
    ...options,
    useWorkerFetch: false,
    BinaryDataFactory,
    // Text extraction does not render PDF images or ICC profiles. Binary resources
    // requested through the main thread are supplied by EmbeddedBinaryDataFactory.
    cMapUrl: undefined, standardFontDataUrl: undefined, wasmUrl: undefined, iccUrl: undefined,
  } : options);
}
