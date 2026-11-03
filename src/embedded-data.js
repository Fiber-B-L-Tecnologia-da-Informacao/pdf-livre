/** PDF.js binary assets are served from memory, never fetched from the network. */
export function embeddedDataFactory(assets) {
  const directories = { cMapUrl: 'cmaps', standardFontDataUrl: 'standard_fonts', wasmUrl: 'wasm' };
  return class EmbeddedBinaryDataFactory {
    async fetch({ kind, filename }) {
      const directory = directories[kind];
      if (!directory || typeof filename !== 'string' || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Recurso PDF inválido.');
      }
      const encoded = assets[`${directory}/${filename}`];
      if (typeof encoded !== 'string') throw new Error(`Recurso não embutido: ${directory}/${filename}`);
      // Each caller receives its own buffer: PDF.js may transfer ownership to its worker.
      return Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    }
  };
}
