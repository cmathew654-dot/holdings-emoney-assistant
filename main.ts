/**
 * Local MVP Entrypoint
 *
 * Usage (browser/devtools):
 * 1) Ensure this module is loaded in the page context.
 * 2) Provide a container element (example: <div id="app"></div>).
 * 3) Call:
 *      runLocalMvp(document.getElementById('app')!);
 *    or with custom CSV text:
 *      runLocalMvp(document.getElementById('app')!, myCsvText);
 *
 * What to expect:
 * - CSV is parsed into a HoldingsIngestionFile.
 * - Review/export surface is rendered into the container.
 * - No backend, no network calls, no persistence, no auto-save.
 */

import { parseHoldingsCsvToIngestionFile } from './holdings-csv-parser';
import { HoldingsIngestionFile } from './holdings-schema';
import { renderReviewExportSurface } from './review-export-surface';

export const SAMPLE_CSV_INPUT = [
  'Account Number,Account Type,Symbol,CUSIP,Security Name,Shares,Market Value,Cost Basis,Acquisition Date',
  '123456789,Taxable Brokerage,VTI,,Vanguard Total Stock Market ETF,100,$25,000,$20,000,2022-05-15',
  '123456789,Taxable Brokerage,,594918104,Microsoft Corp,50,$17,500,$10,000,2021-11-02',
  '123456789,Taxable Brokerage,Subtotal,,,,,,',
].join('\n');

export function runLocalMvp(container: HTMLElement, csvText: string = SAMPLE_CSV_INPUT): HoldingsIngestionFile {
  const ingestionFile = parseHoldingsCsvToIngestionFile(csvText, {
    fileId: `file-${new Date().toISOString()}`,
    sourceFilename: 'inline-sample.csv',
  });

  renderReviewExportSurface(container, ingestionFile, {
    onExport: (payload) => {
      // Local visibility for operator/engineer; no network or persistence.
      console.log('Exported assistant payload:', payload);
    },
  });

  return ingestionFile;
}

// Convenience global for local manual use when loaded in browser.
declare global {
  interface Window {
    runLocalMvp?: typeof runLocalMvp;
  }
}

if (typeof window !== 'undefined') {
  window.runLocalMvp = runLocalMvp;
}
