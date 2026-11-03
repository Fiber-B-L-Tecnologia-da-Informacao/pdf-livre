import * as pdfjs from '../vendor/pdf.mjs';
import { convertFile } from './conversion.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.mjs', import.meta.url).href;
const el = id => document.getElementById(id);
const zone = el('zona'), input = el('entrada'), button = el('botaoConverter');
let selected = null, running = false, controller = null, result = null;
const number = n => n.toLocaleString('pt-BR');
const size = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB` : `${(bytes / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;

function notice(text, kind = 'alerta') {
  const div = document.createElement('div');
  div.className = `aviso ${kind}`;
  div.textContent = text;
  return div;
}
function busy(value) {
  running = value;
  button.disabled = value || !selected;
  input.disabled = value;
  for (const id of ['formatoUnico', 'formatoPartes', 'paginasPorParte', 'limparCarimbos']) el(id).disabled = value;
  zone.setAttribute('aria-disabled', String(value));
  el('botaoCancelar').disabled = !value;
}
function select(file) {
  if (running) return;
  result = null;
  el('etapaResultado').hidden = true;
  el('arquivoInfo').hidden = false;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    selected = null;
    el('arquivoInfo').replaceChildren(notice('Escolha um arquivo PDF.', 'erro'));
    busy(false);
    return;
  }
  selected = file;
  const name = document.createElement('b'); name.textContent = file.name;
  const bytes = document.createElement('span'); bytes.textContent = size(file.size);
  el('arquivoInfo').replaceChildren(name, bytes);
  busy(false);
}
zone.addEventListener('click', () => { if (!running) input.click(); });
zone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!running) input.click(); }
});
zone.addEventListener('dragover', event => { event.preventDefault(); if (!running) zone.classList.add('arrastando'); });
zone.addEventListener('dragleave', () => zone.classList.remove('arrastando'));
zone.addEventListener('drop', event => {
  event.preventDefault(); zone.classList.remove('arrastando');
  if (event.dataTransfer.files.length) select(event.dataTransfer.files[0]);
});
input.addEventListener('change', () => { if (input.files.length) select(input.files[0]); });
el('botaoCancelar').addEventListener('click', () => {
  controller?.abort(); el('botaoCancelar').disabled = true; el('textoPaginas').textContent = 'Cancelando…';
});
function progress({ phase, current, total, percent }) {
  el('barraPreenchida').style.width = `${percent.toFixed(1)}%`;
  el('barraProgresso').setAttribute('aria-valuenow', Math.round(percent));
  el('textoPaginas').textContent = phase === 'zip' ? `Compactando: ${Math.round(percent)}%` : `Página ${number(current)} de ${number(total)}`;
}
button.addEventListener('click', async () => {
  if (running || !selected) return;
  const file = selected;
  const pagesPerPart = Number(el('paginasPorParte').value);
  const split = el('formatoPartes').checked;
  if (split && (!Number.isInteger(pagesPerPart) || pagesPerPart < 10 || pagesPerPart > 5000)) {
    el('arquivoInfo').append(notice('Informe entre 10 e 5.000 páginas por parte.', 'erro')); return;
  }
  const cleanStamps = el('limparCarimbos').checked;
  controller = new AbortController(); result = null; busy(true);
  el('etapaResultado').hidden = true; el('etapaProgresso').hidden = false;
  el('textoPaginas').textContent = 'Lendo o arquivo…'; el('textoTempo').textContent = '';
  el('barraPreenchida').style.width = '0%'; el('barraProgresso').setAttribute('aria-valuenow', 0);
  el('mensagemDownload').replaceChildren();
  try {
    result = await convertFile(file, { reader: pdfjs, zipClass: window.JSZip, split, pagesPerPart, cleanStamps, signal: controller.signal, onProgress: progress });
    const summary = [['Páginas processadas', number(result.total)], ['Arquivos .md', number(result.partCount)], ['Tamanho', size(result.blob.size)], ['Trechos removidos', number(result.removed.length)]];
    el('resumo').replaceChildren(...summary.map(([title, value]) => {
      const div = document.createElement('div'), label = document.createElement('span'), text = document.createElement('b');
      label.textContent = title; text.textContent = value; div.append(label, text); return div;
    }));
    const notices = [notice(`Sequência conferida: ${number(result.total)} blocos na ordem do PDF. Revise o conteúdo extraído.`, 'ok')];
    if (result.emptyPages.length) notices.push(notice(`${number(result.emptyPages.length)} página(s) sem texto extraível: podem estar vazias ou exigir OCR. Veja o relatório.`));
    if (result.lowTextPages.length) notices.push(notice(`${number(result.lowTextPages.length)} página(s) com pouco texto. Isso não comprova que sejam imagens.`));
    if (result.errorPages.length) notices.push(notice(`${number(result.errorPages.length)} página(s) com erro de leitura. Marcadores foram mantidos no Markdown.`, 'erro'));
    if (result.securityFindings.length) notices.push(notice('Foram encontrados controles invisíveis ou possíveis instruções no texto. Eles foram preservados e registrados com página e trecho no relatório. Essa inspeção textual não é uma auditoria completa do PDF.'));
    el('avisos').replaceChildren(...notices);
    el('botaoBaixar').hidden = false; el('botaoRelatorio').hidden = false;
    el('botaoBaixar').textContent = split ? 'Baixar partes (.zip)' : 'Baixar Markdown (.md)';
    el('etapaResultado').hidden = false;
    el('etapaResultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    result = null;
    el('resumo').replaceChildren();
    const message = error.name === 'AbortError' ? 'Conversão cancelada. Nenhum resultado foi disponibilizado.'
      : error.name === 'PasswordException' ? 'PDF protegido por senha. Use uma cópia desbloqueada para converter.'
      : 'Não foi possível concluir a conversão. Confira o arquivo e tente novamente.';
    el('avisos').replaceChildren(notice(message, error.name === 'AbortError' ? 'alerta' : 'erro'));
    el('botaoBaixar').hidden = true; el('botaoRelatorio').hidden = true;
    el('etapaResultado').hidden = false;
  } finally {
    el('etapaProgresso').hidden = true; controller = null; busy(false);
  }
});
function save(name, data) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  el('mensagemDownload').replaceChildren(notice(`Download solicitado: ${name}. Confira a área de downloads do navegador.`, 'ok'));
}
el('botaoBaixar').addEventListener('click', () => { if (result) save(result.name, result.blob); });
el('botaoRelatorio').addEventListener('click', () => { if (result) save(result.reportName, result.report); });
