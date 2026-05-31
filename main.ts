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
import { installRegulatedLedgerStyles } from './ledger-styles';
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(el: HTMLElement, message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
  el.textContent = message;
  el.style.color = tone === 'error' ? '#9f3a32' : tone === 'success' ? '#276b53' : '#746c5d';
}

async function stageLoadStatus(status: HTMLElement, sourceName: string): Promise<void> {
  setStatus(status, `Reading ${sourceName} locally...`);
  await delay(180);
  setStatus(status, 'Parsing holdings and normalizing account rows...');
  await delay(220);
  setStatus(status, 'Running preflight gates: blocked rows, warnings, export eligibility...');
  await delay(260);
}

export function renderLocalMvpShell(root: HTMLElement): void {
  installRegulatedLedgerStyles();
  root.innerHTML = '';

  const shell = document.createElement('main');
  shell.className = 'ledger-shell';

  const hero = document.createElement('section');
  hero.className = 'ledger-hero';

  const heroCopy = document.createElement('div');
  const kicker = document.createElement('p');
  kicker.className = 'ledger-kicker';
  kicker.textContent = 'Local desktop ledger';
  heroCopy.appendChild(kicker);

  const title = document.createElement('h1');
  title.className = 'ledger-title';
  title.textContent = 'Holdings entry, reviewed before every paste.';
  heroCopy.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'ledger-subtitle';
  subtitle.textContent = 'Load a holdings CSV, review the export gate, then conduct eMoney entry one visible clipboard value at a time. No DevTools, no extension, no API, no auto-save.';
  heroCopy.appendChild(subtitle);
  hero.appendChild(heroCopy);

  const assurance = document.createElement('aside');
  assurance.className = 'ledger-assurance';
  assurance.innerHTML = [
    '<strong>Operator boundary</strong>',
    '<span>The app prepares values. The operator chooses where to paste. eMoney Save remains outside this tool.</span>',
  ].join('');
  hero.appendChild(assurance);
  shell.appendChild(hero);

  const controls = document.createElement('section');
  controls.className = 'ledger-panel ledger-load-panel';

  const controlCopy = document.createElement('div');
  const controlTitle = document.createElement('h2');
  controlTitle.textContent = 'Load holdings CSV';
  controlCopy.appendChild(controlTitle);

  const status = document.createElement('p');
  status.className = 'ledger-status-line';
  status.textContent = 'No file loaded yet.';
  controlCopy.appendChild(status);

  const checks = document.createElement('div');
  checks.className = 'ledger-checks';
  [
    ['Input', 'CSV UTF-8'],
    ['Storage', 'None'],
    ['Network', 'No upload'],
    ['eMoney Save', 'Manual'],
  ].forEach(([label, value]) => {
    const check = document.createElement('div');
    check.className = 'ledger-check';
    check.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    checks.appendChild(check);
  });
  controlCopy.appendChild(checks);
  controls.appendChild(controlCopy);

  const actions = document.createElement('div');
  actions.className = 'ledger-actions';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv,text/csv';
  fileInput.className = 'ledger-file-input';
  actions.appendChild(fileInput);

  const sampleButton = document.createElement('button');
  sampleButton.type = 'button';
  sampleButton.textContent = 'Load Demo Sample';
  sampleButton.className = 'ledger-button secondary';
  actions.appendChild(sampleButton);
  controls.appendChild(actions);

  shell.appendChild(controls);

  const reviewRoot = document.createElement('section');
  reviewRoot.id = 'review-root';
  shell.appendChild(reviewRoot);

  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      await stageLoadStatus(status, file.name);
      const text = await file.text();
      runLocalMvp(reviewRoot, text, { sourceFilename: file.name });
      setStatus(status, `${file.name} is ready for review.`, 'success');
    } catch (err) {
      console.error(err);
      setStatus(status, `Could not load CSV: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  sampleButton.onclick = async () => {
    await stageLoadStatus(status, 'demo-sample.csv');
    runLocalMvp(reviewRoot, SAMPLE_CSV_INPUT, { sourceFilename: 'demo-sample.csv' });
    setStatus(status, 'Demo sample is ready for review.', 'success');
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
