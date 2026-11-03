# Bibliotecas de terceiros

O código próprio do PDF Livre é distribuído sob a licença MIT. Isso não altera as licenças das dependências.

| Biblioteca | Versão | Licença | Origem |
| --- | --- | --- | --- |
| PDF.js / pdfjs-dist | 6.5.438 | Apache-2.0 | https://github.com/mozilla/pdf.js |
| JSZip | 3.10.2 | MIT (opção da licença dupla MIT/GPLv3) | https://github.com/Stuk/jszip |

`npm ci` obtém as dependências fixadas em `package-lock.json`. A preparação copia os arquivos de licença para `vendor/`; `npm run build` os inclui em `dist/vendor/`. Os avisos de copyright dos arquivos distribuídos são preservados. PDF.js inclui recursos auxiliares e seus avisos de terceiros dentro das pastas copiadas de `pdfjs-dist`. JSZip também distribui componentes com seus próprios avisos, incluindo pako.

Não remova esses avisos ao redistribuir a aplicação. Consulte também `node_modules/pdfjs-dist/LICENSE`, os avisos das pastas de recursos e `node_modules/jszip/LICENSE.markdown`.
