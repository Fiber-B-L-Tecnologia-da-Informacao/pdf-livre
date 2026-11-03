<div align="center">

# PDF Livre

### Seus documentos em Markdown. Seus arquivos sob seu controle.

Converta PDFs em texto organizado por página, direto no navegador.<br>
**Sem cadastro. Sem envio do documento para conversão. Código aberto.**

Uma iniciativa da **Fiber Banda Larga Tecnologia da Informação**.

[Começar](#começar) · [Recursos](#recursos) · [Privacidade](#privacidade) · [Contribuir](#contribuir)

</div>

---

![Interface do PDF Livre com conversão de um documento sintético](./assets/preview.png)

## Por que PDF Livre?

Um PDF nem sempre é o melhor formato para pesquisar, editar ou reutilizar texto. O PDF Livre transforma o conteúdo extraível em Markdown e mantém uma referência para cada página do original.

Ele nasceu de uma ferramenta para documentos e processos extensos. A Fiber abriu o código para que outras pessoas possam usar, estudar e melhorar a solução — inclusive para outros tipos de documento.

## Recursos

- **Conversão local:** o navegador lê o PDF no seu dispositivo.
- **Referência por página:** cada bloco começa com `## Página N`.
- **Duas entregas:** um arquivo `.md` ou um ZIP com partes numeradas.
- **Conferência da sequência:** valida a quantidade e a ordem dos blocos gerados.
- **Relatório de extração:** lista páginas sem texto, páginas curtas, erros e trechos removidos.
- **Texto preservado por padrão:** limpeza de possíveis carimbos é opcional e registrada.
- **Cancelamento e progresso:** acompanhe as páginas processadas e interrompa a conversão.
- **Sem CDN:** bibliotecas e recursos são servidos junto com a aplicação.
- **Interface em português**, com adaptação ao tema claro ou escuro do dispositivo.

## Começar

### Rodar no seu computador

Instale o [Node.js](https://nodejs.org/) **24.22.2 ou superior**, em uma versão LTS suportada. Depois:

```bash
git clone https://github.com/Fiber-B-L-Tecnologia-da-Informacao/pdf-livre.git
cd pdf-livre
npm ci
npm run dev
```

Abra **http://127.0.0.1:4173** no navegador. A instalação baixa as dependências; a conversão não precisa de serviços externos. Não abra `index.html` por duplo clique: módulos e workers precisam de um servidor HTTP.

### Converter

1. Escolha ou arraste um PDF com texto selecionável.
2. Selecione arquivo único ou partes em ZIP. No ZIP, escolha de 10 a 5.000 páginas por parte.
3. Mantenha a limpeza desativada para preservar o texto. Se a ativar, confira as remoções no relatório.
4. Clique em **Converter** e baixe o resultado e o relatório de conferência.

Exemplo de saída:

```markdown
# meu-documento

Páginas: 2

## Página 1

Texto extraído da primeira página.

## Página 2

Texto extraído da segunda página.
```

No modo ZIP, os nomes mantêm a ordem mesmo ao classificar por nome:

```text
meu-documento_parte_001_pag_00001_a_00300.md
meu-documento_parte_002_pag_00301_a_00600.md
_relatorio_de_conferencia.txt
```

## Privacidade

O aplicativo não contém upload de documentos, analytics ou serviços de conversão remota. O PDF é lido em memória, e os downloads são criados no navegador. Não há persistência de documentos pela aplicação.

O servidor de hospedagem recebe as solicitações normais para carregar a página e seus arquivos estáticos. Isso é diferente de receber o conteúdo do PDF. Extensões do navegador, o dispositivo, o provedor de hospedagem e modificações de terceiros estão fora do controle deste projeto.

O relatório pode conter trechos do documento, incluindo texto removido. Trate o Markdown, o ZIP e o relatório com a mesma confidencialidade do PDF original.

## Limitações que vale conhecer

- **Não faz OCR.** PDFs digitalizados podem não produzir texto. Uma página sem texto também pode estar vazia.
- **Não reconstrói a diagramação.** Tabelas, colunas, imagens, fórmulas e ordem visual complexa podem perder estrutura.
- **Conferir páginas não comprova fidelidade.** A validação verifica os blocos gerados, não a equivalência integral ao original. Erros de leitura ficam marcados.
- **A limpeza é heurística.** Pode remover conteúdo legítimo, sobretudo texto girado. Por isso vem desligada.
- **Não há tamanho máximo garantido.** Arquivos grandes e compactação consomem memória. Dividir o resultado facilita o uso, mas não elimina o consumo em memória da conversão.
- **PDFs protegidos por senha** exigem uma cópia desbloqueada.
- **A inspeção textual de segurança é limitada.** Sinaliza alguns caracteres invisíveis e possíveis instruções com página e trecho; não é uma auditoria de fontes, camadas, malware ou de toda divergência visual.

O texto do PDF deve ser tratado como conteúdo não confiável, especialmente quando enviado a ferramentas de IA. O aplicativo não executa instruções do documento.

## Desenvolvimento

JavaScript com módulos nativos, CSS e HTML. Sem framework ou etapa de compilação do código próprio.

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Instala versões fixadas e prepara as bibliotecas locais |
| `npm run dev` | Inicia o servidor local na porta 4173 |
| `npm test` | Executa testes de extração e conversão |
| `npm run build` | Gera a aplicação estática completa em `dist/` |
| `npm run check` | Verifica sintaxe, testes e geração da distribuição |
| `node scripts/serve.mjs --dist` | Testa a distribuição gerada |

```text
src/          Interface, estilos e lógica de conversão
scripts/      Preparação de bibliotecas, servidor e distribuição
tests/        Casos sintéticos; sem documentos pessoais
assets/       Recursos visuais do projeto
docs/         Arquitetura e registro da recuperação do código
.github/      Verificação automatizada
```

### Hospedar

Execute `npm ci` e `npm run build`. Publique **o conteúdo de `dist/`** em uma hospedagem estática com HTTPS, preservando caminhos e tipos MIME de JavaScript e WebAssembly. O aplicativo funciona em subdiretórios. A distribuição é uma pasta completa; não é um HTML único.

Não há backend, banco de dados, chave de API nem variável secreta exigida. O servidor local incluído é apenas para desenvolvimento.

## Contribuir

Encontrou um problema? Abra uma [issue](https://github.com/Fiber-B-L-Tecnologia-da-Informacao/pdf-livre/issues) com o comportamento esperado e o observado. Use exemplos sintéticos e nunca publique documentos pessoais, jurídicos ou empresariais confidenciais.

Para enviar uma melhoria, consulte [CONTRIBUTING.md](./CONTRIBUTING.md). Mudanças na extração devem incluir um teste que demonstre o problema e a correção.

## Sobre a Fiber

A **Fiber Banda Larga Tecnologia da Informação** disponibiliza este projeto para compartilhar conhecimento e colaborar com a comunidade de software livre. Se ele for útil, considere dar uma estrela, compartilhar o repositório e contribuir com melhorias.

## Licença

Código próprio sob a [licença MIT](./LICENSE): você pode usar, modificar e redistribuir, inclusive comercialmente, mantendo o aviso de licença. Bibliotecas de terceiros mantêm suas próprias licenças; consulte [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
