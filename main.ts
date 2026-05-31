/**
 * Local MVP Entrypoint
 *
 * Operator usage (local browser demo):
 * 1) Run `npm run start:demo` from the repo root.
 * 2) Open the printed localhost URL.
 * 3) Click "Choose CSV File" or "Load Demo Sample".
 *
 * Developer usage remains available:
 *   runLocalMvp(document.getElementById('review-root')!, myCsvText);
 *
 * Safety: all parsing/rendering happens locally in the browser. There is no
 * backend, no network upload, no persistence, and no auto-save behavior.
 */

import { parseHoldingsCsvToIngestionFile } from './holdings-csv-parser';
import type { HoldingsIngestionFile } from './holdings-schema';
import { renderReviewExportSurface } from './review-export-surface';

export const SAMPLE_CSV_INPUT = [
  'Account Description,Account Number,Owner,Last Updated,Symbol,Description,Quantity,Price,Cost Basis,Value,Asset Class',
  'Demo Account,123456789,Demo Client,05/26/2026,AAPL,APPLE INCORPORATED,10,$100.00,$1450.00,$3000.00,US Large Cap Blend',
  'Demo Account,123456789,Demo Client,05/26/2026,MSFT,MICROSOFT CORPORATION,5,$100.00,$1800.00,$2500.00,US Large Cap Value',
  'Demo Account,123456789,Demo Client,05/26/2026,GOOG,ALPHABET INCORPORATED CAP STK CLASS C,3,$100.00,$900.00,$1200.00,US Large Cap Blend',
].join('\n');

export function runLocalMvp(
  container: HTMLElement,
  csvText: string = SAMPLE_CSV_INPUT,
  opts?: { sourceFilename?: string }
): HoldingsIngestionFile {
  const ingestionFile = parseHoldingsCsvToIngestionFile(csvText, {
    fileId: `file-${new Date().toISOString()}`,
    sourceFilename: opts?.sourceFilename ?? 'inline-sample.csv',
  });

  renderReviewExportSurface(container, ingestionFile, {
    onExport: (payload) => {
      // Local visibility for operator/engineer; no network or persistence.
      console.log('Exported assistant payload:', payload);
    },
  });

  return ingestionFile;
}

function setStatus(el: HTMLElement, message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
  el.textContent = message;
  el.style.color = tone === 'error' ? '#991b1b' : tone === 'success' ? '#166534' : '#334155';
}

export function renderLocalMvpShell(root: HTMLElement): void {
  root.innerHTML = '';

  const shell = document.createElement('main');
  shell.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  shell.style.maxWidth = '1200px';
  shell.style.margin = '0 auto';
  shell.style.padding = '24px';
  shell.style.color = '#111827';

  const title = document.createElement('h1');
  title.textContent = 'Holdings Transformer + eMoney Entry Assistant';
  title.style.marginBottom = '4px';
  shell.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Local-only CSV review. Generates an eMoney fill snippet; never clicks Save.';
  subtitle.style.marginTop = '0';
  subtitle.style.color = '#475569';
  shell.appendChild(subtitle);

  const controls = document.createElement('section');
  controls.style.border = '1px solid #cbd5e1';
  controls.style.borderRadius = '10px';
  controls.style.padding = '16px';
  controls.style.margin = '16px 0';
  controls.style.background = '#f8fafc';

  const controlTitle = document.createElement('h2');
  controlTitle.textContent = '1. Load holdings CSV';
  controlTitle.style.marginTop = '0';
  controls.appendChild(controlTitle);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv,text/csv';
  fileInput.style.marginRight = '12px';
  controls.appendChild(fileInput);

  const sampleButton = document.createElement('button');
  sampleButton.type = 'button';
  sampleButton.textContent = 'Load Demo Sample';
  sampleButton.style.marginRight = '12px';
  controls.appendChild(sampleButton);

  const status = document.createElement('p');
  status.textContent = 'No file loaded yet.';
  status.style.marginBottom = '0';
  controls.appendChild(status);

  const safety = document.createElement('p');
  safety.textContent = 'Safety: CSV stays in this browser. No backend, no upload, no auto-save.';
  safety.style.fontWeight = '600';
  safety.style.color = '#334155';
  controls.appendChild(safety);

  shell.appendChild(controls);

  const reviewRoot = document.createElement('section');
  reviewRoot.id = 'review-root';
  shell.appendChild(reviewRoot);

  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      setStatus(status, `Loading ${file.name}...`);
      const text = await file.text();
      runLocalMvp(reviewRoot, text, { sourceFilename: file.name });
      setStatus(status, `Loaded ${file.name}. Review eligible and blocked rows below.`, 'success');
    } catch (err) {
      console.error(err);
      setStatus(status, `Could not load CSV: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  sampleButton.onclick = () => {
    runLocalMvp(reviewRoot, SAMPLE_CSV_INPUT, { sourceFilename: 'demo-sample.csv' });
    setStatus(status, 'Loaded built-in demo sample. Review eligible rows below.', 'success');
  };

  root.appendChild(shell);
}

// Convenience globals for local manual use when loaded in browser.
declare global {
  interface Window {
    runLocalMvp?: typeof runLocalMvp;
    renderLocalMvpShell?: typeof renderLocalMvpShell;
  }
}

if (typeof window !== 'undefined') {
  window.runLocalMvp = runLocalMvp;
  window.renderLocalMvpShell = renderLocalMvpShell;
}
