# Recuperação e verificação do código

## Origem local

A aplicação foi recuperada de um HTML autossuficiente fornecido pelo mantenedor. O original foi preservado localmente e não faz parte da publicação.

SHA-256 do HTML original:

```text
d8c9bb82d42d404193b3c0f4dfd05713fdbd86cbe2e950053bc978b80f123305
```

O HTML continha quatro scripts: PDF.js 3.11.174, seu worker, JSZip 3.10.1 e código próprio em JavaScript legível. Não foi necessário inventar ou decompilar código-fonte ausente. Bibliotecas de terceiros foram substituídas por dependências atuais fixadas no manifesto, preservando licenças.

## Varredura estática inicial

- Linha 67: `[hidden] { display: none !important; }`.
- Linha 225: seletor de arquivo `entrada` oculto, acionado pela área de seleção.
- Linha 226: `arquivoInfo` oculto até a seleção.
- Linhas 252 e 264: progresso e resultado ocultos até as respectivas etapas.

Esses elementos correspondem ao fluxo da interface. Na varredura textual aplicada não foram encontrados controles Unicode invisíveis/direcionais ou instruções de prompt injection. Isso é um resultado limitado aos padrões e ao HTML inspecionados, não uma certificação de segurança de qualquer PDF futuro. Foram identificados os quatro scripts embutidos antes de executar a aplicação.

## Análise com REA

REA analisou estaticamente o script próprio extraído, sem executar o HTML. Evidência principal:

```text
ev_b08cb0fbdf48ab0adbd304a09c3797393d77bf20a2ed53847958dcca40d83291
```

Resumo:

```text
ev_39243755fd9447d6b771f7159ec0bf42660cf7fa183f05eef4e5ea11db77d067
```

Foi analisado um script de 16.449 bytes, com 2.626 nós de sintaxe e nenhuma falha de parsing. As três bibliotecas inventariadas não fizeram parte da análise semântica selecionada. A cobertura do grafo é parcial, com relações dinâmicas desconhecidas; a análise estática não comprova comportamento em execução. Os identificadores são referências da sessão de investigação, não URLs públicas de consulta.

## Alterações para publicação

- Separação de HTML, CSS, interface, orquestração e funções puras.
- Dependências PDF.js e JSZip atualizadas e servidas localmente.
- Texto e conteúdo girado preservados por padrão; limpeza opcional com relatório.
- Trava de conversão e captura do arquivo selecionado por execução.
- Tratamento de erros e liberação de recursos, incluindo falha de ZIP.
- Cancelamento impede a disponibilização de resultados após leitura/compactação.
- Página curta não é automaticamente classificada como digitalizada.
- Remoção de mensagens dependentes de um ambiente de chat.
- Inclusão de testes sintéticos, documentação, licenças e verificação automatizada.

## Validação

Os testes usam `node:test`, PDF sintético lido pelo PDF.js real, mocks para falhas/cancelamento e leitura de ZIP com JSZip real. A interface também foi exercitada em navegador com um PDF sintético de três páginas, incluindo acentos e página vazia. Dados de usuários não são usados como fixtures.
