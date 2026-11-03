# Distribuição offline e validação

## Arquivos entregues

- `pdf-livre.html`: interface, código próprio, PDF.js, worker, JSZip, fontes, CMaps, recursos auxiliares e avisos de licença em um arquivo.
- `SHA256SUMS.txt`: integridade do HTML entregue, em SHA-256.

A instalação e a geração exigem dependências de desenvolvimento; o usuário final baixa somente o HTML. O arquivo não depende de pastas vizinhas, CDN ou servidor de conversão. O código-fonte editável permanece no repositório.

## Geração

```bash
npm ci
npm run build:offline
```

`npm run build` também inclui o HTML único, além da pasta estática para desenvolvimento. Para conferir por HTTP local, execute `npm run preview:offline`.

## Verificações realizadas em 03/11/2026

- 25 testes automatizados aprovados, incluindo extração, ZIP, cancelamento, carregamento de recursos embutidos, fechamento do pacote, hashes dos scripts e SHA-256 do HTML.
- Abertura do HTML único por HTTP local no navegador, sem carregar scripts ou estilos de pastas vizinhas.
- Rede da aba desativada depois de carregar o HTML, antes de escolher o PDF e iniciar a conversão.
- Conversão de PDF sintético de três páginas com acentos e uma página vazia.
- Downloads de Markdown e ZIP, com conferência de conteúdo, ordem e relatório.
- Eventos observados após desligar a rede continham somente URLs `blob:` locais, sem solicitações HTTP/HTTPS durante as conversões observadas.
- Nenhum aviso ou erro de console no teste inicial de conversão.

A abertura automatizada direta por `file://` foi bloqueada pela política do navegador controlado. Não foi contornado esse bloqueio. O teste acima demonstra o conteúdo embutido funcionando sem rede após o carregamento por HTTP; não comprova por si só a abertura por duplo clique em todos os navegadores. A conferência por abertura direta no computador do mantenedor deve ser registrada separadamente.

## Relato de documento grande

O mantenedor informou ter convertido integralmente para Markdown um PDF gerado com **50.000 páginas e mais de 600 MB**. Não foram fornecidos o arquivo, a versão exata, tempo, navegador ou configuração do computador para reprodução deste resultado. Ele é documentado como relato de uso, não como benchmark desta release ou tamanho máximo garantido.

## Conferir o download

No macOS ou Linux:

```bash
shasum -a 256 pdf-livre.html
```

Compare com `SHA256SUMS.txt` do mesmo lançamento. Não compare com outra release, pois cada alteração do código muda o checksum.
