# Como contribuir

1. Abra uma issue para discutir mudanças maiores.
2. Crie uma branch com nome descritivo, como `fix/espacos-entre-palavras`.
3. Instale com `npm ci` e desenvolva com `npm run dev`.
4. Adicione testes de regressão para mudanças na extração ou na entrega.
5. Execute `npm run check` e teste a interface com um PDF sintético.
6. No pull request, explique o problema, a solução e a verificação. Para mudanças visuais, inclua uma captura sem dados privados.

Use JavaScript ESM, indentação de dois espaços e funções pequenas. O projeto não tem um formatador ou linter configurado; mantenha o estilo do arquivo editado. Os testes usam `node:test`, têm nomes descritivos e ficam em `tests/*.test.js`.

Use mensagens de commit curtas e no imperativo, por exemplo `Corrige espaços entre fragmentos de texto`. Nunca inclua PDFs de usuários, resultados de conversão, credenciais ou dados pessoais. Use fixtures sintéticas geradas nos testes.

Preserve o processamento local e os avisos de terceiros. Não adicione telemetria ou serviços externos sem discussão explícita. Relatos de segurança devem seguir [SECURITY.md](./SECURITY.md).
