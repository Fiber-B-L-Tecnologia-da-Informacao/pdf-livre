# Arquitetura

O PDF Livre é uma aplicação estática de navegador. Não há API de conversão, banco ou autenticação.

1. `src/app.js` seleciona um `File` e mantém uma única execução ativa. Desabilita seleção e opções até a conclusão.
2. `src/conversion.js` lê os bytes, abre PDF.js em worker local, percorre páginas e executa limpeza de recursos em `finally`.
3. `src/converter.js` contém funções puras para reconstruir linhas, sinalizar texto suspeito, produzir blocos, validar sequência, dividir partes e gerar o relatório.
4. PDF.js interpreta o PDF; JSZip compacta as partes. Ambos são instalados com versões fixadas e copiados para `vendor/`.
5. O navegador cria downloads com `Blob` e URLs temporárias, revogadas após o clique. O aplicativo confirma a solicitação, não a gravação no disco.

## Cancelamento

Um `AbortController` interrompe o carregamento por `loadingTask.destroy()`. A conversão verifica o sinal entre páginas e após a compactação. A compactação do JSZip pode terminar internamente antes de o cancelamento ser reconhecido; o resultado cancelado não é disponibilizado.

## Texto e limites

Itens textuais vêm de `getTextContent()`. O agrupamento usa coordenadas e lacunas entre itens; não é reconstrução semântica de layouts. A sequência valida o número e os cabeçalhos dos blocos, inclusive marcadores de páginas com erro. A limpeza é opcional, heurística e registrada. A inspeção textual ocorre antes dela, preserva o conteúdo e não substitui comparação visual ou inspeção completa de fontes/camadas.

O arquivo e todos os blocos ficam em memória; ZIP também consome memória. Processar páginas sequencialmente não implica streaming completo nem suporte ilimitado a arquivos grandes.
