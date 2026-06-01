import type { AssistantAccountPayload } from './review-export-surface';

export type PasteConductorFieldName = 'ticker' | 'units' | 'costBasis';
export type TransferSessionStatus = 'ready' | 'in_progress' | 'complete';

export interface BatchPastePreviewRow {
  rowNumber: number;
  ticker: string;
  units: string;
  costBasis: string;
}

export interface BatchPastePayload {
  accountId: string;
  accountNumber: string;
  accountType: string;
  rowCount: number;
  blockedCount: number;
  includedFields: PasteConductorFieldName[];
  excludedFields: string[];
  clipboardText: string;
  previewRows: BatchPastePreviewRow[];
}

export interface EmoneyFillPacketHolding {
  rowNumber: number;
  ticker: string;
  cusip: string;
  units: string;
  costBasis: string;
}

export interface EmoneyFillPacket {
  schemaVersion: 'emoney-fill-packet/v1';
  createdAt: string;
  accountId: string;
  accountNumber: string;
  accountType: string;
  rowCount: number;
  blockedCount: number;
  approvedFields: PasteConductorFieldName[];
  excludedFields: string[];
  holdings: EmoneyFillPacketHolding[];
}

export interface TransferStep {
  stepId: string;
  rowNumber: number;
  fieldName: PasteConductorFieldName;
  fieldLabel: string;
  ticker: string;
  clipboardValue: string;
  operatorInstruction: string;
}

export interface TransferSession {
  accountId: string;
  accountNumber: string;
  accountType: string;
  blockedCount: number;
  totalRows: number;
  totalSteps: number;
  currentStepIndex: number;
  status: TransferSessionStatus;
  allowedFields: PasteConductorFieldName[];
  disallowedFields: string[];
  steps: TransferStep[];
}

const FIELD_LABELS: Record<PasteConductorFieldName, string> = {
  ticker: 'Ticker',
  units: 'Units',
  costBasis: 'Cost Basis',
};

const ALLOWED_FIELDS: PasteConductorFieldName[] = ['ticker', 'units', 'costBasis'];
const DISALLOWED_FIELDS = ['marketValue', 'assetClass', 'sector', 'save'];
const FILL_PACKET_SCHEMA_VERSION = 'emoney-fill-packet/v1' as const;

function formatClipboardCell(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(/[\t\r\n]+/g, ' ').trim();
}

export function buildBatchPastePayload(
  payload: AssistantAccountPayload,
  opts?: { blockedCount?: number }
): BatchPastePayload {
  const previewRows = payload.holdings.map((holding, holdingIndex) => ({
    rowNumber: holdingIndex + 1,
    ticker: formatClipboardCell(holding.ticker),
    units: formatClipboardCell(holding.units),
    costBasis: formatClipboardCell(holding.costBasis),
  }));

  return {
    accountId: payload.accountId,
    accountNumber: payload.accountNumber,
    accountType: payload.accountType,
    rowCount: previewRows.length,
    blockedCount: opts?.blockedCount ?? 0,
    includedFields: [...ALLOWED_FIELDS],
    excludedFields: [...DISALLOWED_FIELDS],
    clipboardText: previewRows
      .map((row) => [row.ticker, row.units, row.costBasis].join('\t'))
      .join('\n'),
    previewRows,
  };
}

export function buildEmoneyFillPacket(
  payload: AssistantAccountPayload,
  opts?: { blockedCount?: number; createdAt?: string }
): EmoneyFillPacket {
  const holdings = payload.holdings.map((holding, holdingIndex) => ({
    rowNumber: holdingIndex + 1,
    ticker: formatClipboardCell(holding.ticker),
    cusip: formatClipboardCell(holding.cusip),
    units: formatClipboardCell(holding.units),
    costBasis: formatClipboardCell(holding.costBasis),
  }));

  return {
    schemaVersion: FILL_PACKET_SCHEMA_VERSION,
    createdAt: opts?.createdAt ?? new Date().toISOString(),
    accountId: payload.accountId,
    accountNumber: payload.accountNumber,
    accountType: payload.accountType,
    rowCount: holdings.length,
    blockedCount: opts?.blockedCount ?? 0,
    approvedFields: [...ALLOWED_FIELDS],
    excludedFields: [...DISALLOWED_FIELDS],
    holdings,
  };
}

export function serializeEmoneyFillPacket(packet: EmoneyFillPacket): string {
  return JSON.stringify(packet, null, 2);
}

const EMONEY_FILL_BUTTON_SCRIPT = `(() => {
  const OVERLAY_ID = 'emoney-fill-button-overlay';
  const PACKET_SCHEMA_VERSION = 'emoney-fill-packet/v1';
  const PACKET_MAX_AGE_MS = 8 * 60 * 60 * 1000;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const state = { packet: null, status: 'idle', busy: false, results: [] };

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function visible(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function fire(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function setValue(el, value) {
    if (!el) throw new Error('Expected field was not found.');
    el.focus();
    el.value = String(value || '');
    fire(el);
  }

  function visibleInputs() {
    return Array.from(document.querySelectorAll('input, textarea'))
      .filter((el) => visible(el) && !el.disabled && !el.readOnly);
  }

  function isExpectedEmoneyHoldingsPage() {
    const host = normalize(location.hostname);
    const pageText = normalize((document.title || '') + ' ' + location.href + ' ' + ((document.body && document.body.innerText) || '').slice(0, 12000));
    return host.includes('emoney') && pageText.includes('holding');
  }

  function buttonText(el) {
    return normalize((el.textContent || '') + ' ' + (el.value || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || ''));
  }

  function findAddHoldingButton() {
    return Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'))
      .find((el) => buttonText(el).includes('add a holding')) || null;
  }

  async function clickAddHolding() {
    const button = findAddHoldingButton();
    if (!button) throw new Error('Could not find Add a Holding. Stop and enter manually.');
    const before = visibleInputs().length;
    button.click();
    for (let i = 0; i < 24; i += 1) {
      await sleep(250);
      if (visibleInputs().length > before) return;
    }
    throw new Error('Add a Holding did not create a detectable row. Stop and enter manually.');
  }

  function newestTickerField() {
    const candidates = visibleInputs().filter((el) => /ticker/i.test(el.id || '') || /ticker/i.test(el.name || ''));
    return candidates[candidates.length - 1] || null;
  }

  function rowFieldsFromTicker(tickerEl) {
    const fields = visibleInputs();
    const start = fields.indexOf(tickerEl);
    if (start < 0) throw new Error('Ticker field was not found in the visible input list. Stop and enter manually.');
    const nearby = fields.slice(start, start + 16);
    return {
      ticker: nearby[0],
      units: nearby[4],
      costBasis: nearby[5],
    };
  }

  function existingLookupTokens() {
    const tokens = new Set();
    visibleInputs().forEach((el) => {
      const name = String((el.id || '') + ' ' + (el.name || '')).toLowerCase();
      if (name.includes('ticker') || name.includes('cusip')) {
        const value = normalize(el.value);
        if (value) tokens.add(value);
      }
    });
    return tokens;
  }

  function findDuplicateHolding(packet) {
    const tokens = existingLookupTokens();
    return packet.holdings.find((row) => {
      const ticker = normalize(row.ticker);
      const cusip = normalize(row.cusip);
      return (ticker && tokens.has(ticker)) || (cusip && tokens.has(cusip));
    }) || null;
  }

  function validatePacket(packet) {
    if (!packet || typeof packet !== 'object') throw new Error('Fill packet is malformed.');
    if (packet.schemaVersion !== PACKET_SCHEMA_VERSION) throw new Error('Fill packet version is not supported.');
    const createdMs = Date.parse(packet.createdAt);
    if (!Number.isFinite(createdMs)) throw new Error('Fill packet timestamp is invalid.');
    if (Date.now() - createdMs > PACKET_MAX_AGE_MS) throw new Error('Fill packet is stale. Return to the desktop app and copy a fresh packet.');
    if (!Array.isArray(packet.holdings) || packet.holdings.length === 0) throw new Error('Fill packet has no eligible holdings.');
    if (packet.rowCount !== packet.holdings.length) throw new Error('Fill packet row count does not match holdings.');
    const approved = JSON.stringify(packet.approvedFields || []);
    if (approved !== JSON.stringify(['ticker', 'units', 'costBasis'])) throw new Error('Fill packet approved fields are not allowed.');
    packet.holdings.forEach((row, index) => {
      if (!normalize(row.ticker)) throw new Error('Row ' + (index + 1) + ' is missing ticker.');
      if (!normalize(row.units)) throw new Error('Row ' + (index + 1) + ' is missing units.');
      if (!normalize(row.costBasis)) throw new Error('Row ' + (index + 1) + ' is missing cost basis.');
    });
    return packet;
  }

  function parsePacketText(text) {
    return validatePacket(JSON.parse(text));
  }

  function ensureOverlay() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.textContent = '#' + OVERLAY_ID + '{position:fixed;right:24px;top:24px;z-index:2147483647;width:420px;max-width:calc(100vw - 48px);font:14px/1.45 Georgia,serif;color:#1f2a2a;background:#fbfaf4;border:1px solid #1f2a2a;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:18px}#' + OVERLAY_ID + ' h2{font:700 20px/1.1 Georgia,serif;margin:0 0 10px}#' + OVERLAY_ID + ' p{margin:8px 0}#' + OVERLAY_ID + ' textarea{width:100%;height:120px;margin:10px 0;font:12px Consolas,monospace}#' + OVERLAY_ID + ' button{margin:8px 8px 0 0;border:1px solid #1f2a2a;background:#1f2a2a;color:#fff;padding:8px 10px;font:700 12px Arial,sans-serif;cursor:pointer}#' + OVERLAY_ID + ' button.secondary{background:#fbfaf4;color:#1f2a2a}#' + OVERLAY_ID + ' button:disabled{opacity:.45;cursor:not-allowed}#' + OVERLAY_ID + ' .bad{color:#9b1c1c;font-weight:700}#' + OVERLAY_ID + ' .ok{color:#17623a;font-weight:700}#' + OVERLAY_ID + ' .meta{border-top:1px solid #d8d0bf;border-bottom:1px solid #d8d0bf;padding:8px 0;margin:10px 0}';
    document.head.appendChild(style);

    const overlay = document.createElement('section');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Fill eMoney Holdings');
    overlay.innerHTML =
      '<h2>Fill eMoney Holdings</h2>' +
      '<p id="emfb-status">Read the reviewed packet from clipboard, then confirm before any row is changed.</p>' +
      '<div class="meta" id="emfb-meta">No packet loaded.</div>' +
      '<textarea id="emfb-paste" placeholder="Paste packet manually if Chrome blocks clipboard access." hidden></textarea>' +
      '<div>' +
      '<button id="emfb-read">Read Clipboard</button>' +
      '<button id="emfb-use-paste" class="secondary" hidden>Use Pasted Packet</button>' +
      '<button id="emfb-confirm" disabled>Confirm Fill Rows</button>' +
      '<button id="emfb-close" class="secondary">Close</button>' +
      '</div>' +
      '<p><strong>Boundary:</strong> Save remains manual. This helper fills ticker, units, and cost basis only.</p>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function updateOverlay() {
    const status = document.getElementById('emfb-status');
    const meta = document.getElementById('emfb-meta');
    const confirm = document.getElementById('emfb-confirm');
    if (!status || !meta || !confirm) return;
    status.className = state.status.startsWith('Error') ? 'bad' : state.status.startsWith('Complete') ? 'ok' : '';
    status.textContent = state.status;
    if (state.packet) {
      meta.innerHTML =
        '<strong>Account:</strong> ' + state.packet.accountNumber + '<br>' +
        '<strong>Rows:</strong> ' + state.packet.rowCount + ' eligible; ' + state.packet.blockedCount + ' blocked excluded<br>' +
        '<strong>Included:</strong> ticker, units, cost basis<br>' +
        '<strong>Excluded:</strong> market value, asset class, sector, Save';
    }
    confirm.disabled = !state.packet || state.busy;
  }

  function setError(message) {
    state.status = 'Error: ' + message;
    updateOverlay();
  }

  async function loadClipboardPacket() {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) throw new Error('Clipboard read is unavailable.');
      const text = await navigator.clipboard.readText();
      state.packet = parsePacketText(text);
      state.status = 'Packet ready. Confirm this is the correct eMoney Holdings page for account ' + state.packet.accountNumber + '.';
      updateOverlay();
    } catch (err) {
      const paste = document.getElementById('emfb-paste');
      const usePaste = document.getElementById('emfb-use-paste');
      if (paste) paste.hidden = false;
      if (usePaste) usePaste.hidden = false;
      setError((err && err.message ? err.message : String(err)) + ' Paste packet manually if Chrome blocks clipboard access.');
    }
  }

  function loadPastedPacket() {
    try {
      const paste = document.getElementById('emfb-paste');
      state.packet = parsePacketText(paste ? paste.value : '');
      state.status = 'Packet ready. Confirm this is the correct eMoney Holdings page for account ' + state.packet.accountNumber + '.';
      updateOverlay();
    } catch (err) {
      setError(err && err.message ? err.message : String(err));
    }
  }

  async function fillRows() {
    if (!state.packet || state.busy) return;
    state.busy = true;
    updateOverlay();
    try {
      if (!isExpectedEmoneyHoldingsPage()) throw new Error('This does not look like the expected eMoney Holdings page.');
      const duplicate = findDuplicateHolding(state.packet);
      if (duplicate) throw new Error('Possible duplicate existing holding detected for ' + duplicate.ticker + '. No rows were filled.');
      state.results = [];
      for (let i = 0; i < state.packet.holdings.length; i += 1) {
        const row = state.packet.holdings[i];
        state.status = 'Adding row ' + (i + 1) + ' of ' + state.packet.holdings.length + ': ' + row.ticker;
        updateOverlay();
        await clickAddHolding();
        await sleep(500);
        const tickerEl = newestTickerField();
        if (!tickerEl) throw new Error('Could not find newest ticker field after adding row.');
        const fields = rowFieldsFromTicker(tickerEl);
        if (!fields.ticker || !fields.units || !fields.costBasis) throw new Error('Could not locate ticker, units, and cost basis fields.');
        setValue(fields.ticker, row.ticker);
        await sleep(900);
        setValue(fields.units, row.units);
        setValue(fields.costBasis, row.costBasis);
        state.results.push({ row: i + 1, ticker: row.ticker, status: 'filled' });
      }
      state.status = 'Complete: rows filled. Review every row in eMoney. Save remains manual.';
      console.table(state.results);
      console.log('Fill eMoney Holdings complete. Save remains manual.', state.results);
    } catch (err) {
      setError(err && err.message ? err.message : String(err));
      console.error('Fill eMoney Holdings stopped before completion.', err);
    } finally {
      state.busy = false;
      updateOverlay();
    }
  }

  const overlay = ensureOverlay();
  overlay.querySelector('#emfb-read').addEventListener('click', loadClipboardPacket);
  overlay.querySelector('#emfb-use-paste').addEventListener('click', loadPastedPacket);
  overlay.querySelector('#emfb-confirm').addEventListener('click', fillRows);
  overlay.querySelector('#emfb-close').addEventListener('click', () => overlay.remove());
  state.status = 'Ready. Click Read Clipboard, or paste packet manually if Chrome blocks clipboard access.';
  updateOverlay();
})();`;

export function buildEmoneyFillButtonScript(): string {
  return EMONEY_FILL_BUTTON_SCRIPT;
}

export function buildEmoneyFillBookmarklet(): string {
  return `javascript:${encodeURIComponent(EMONEY_FILL_BUTTON_SCRIPT)}`;
}

export function buildPasteConductorSession(
  payload: AssistantAccountPayload,
  opts?: { blockedCount?: number }
): TransferSession {
  const steps: TransferStep[] = [];

  payload.holdings.forEach((holding, holdingIndex) => {
    const rowNumber = holdingIndex + 1;
    const rowTicker = String(holding.ticker ?? '').trim() || `Row ${rowNumber}`;
    const values: Record<PasteConductorFieldName, unknown> = {
      ticker: holding.ticker,
      units: holding.units,
      costBasis: holding.costBasis,
    };

    ALLOWED_FIELDS.forEach((fieldName) => {
      const clipboardValue = values[fieldName] == null ? '' : String(values[fieldName]);
      steps.push({
        stepId: `row-${rowNumber}-${fieldName}`,
        rowNumber,
        fieldName,
        fieldLabel: FIELD_LABELS[fieldName],
        ticker: rowTicker,
        clipboardValue,
        operatorInstruction: `Paste into eMoney row ${rowNumber} ${FIELD_LABELS[fieldName]} field, then mark this step complete.`,
      });
    });
  });

  return {
    accountId: payload.accountId,
    accountNumber: payload.accountNumber,
    accountType: payload.accountType,
    blockedCount: opts?.blockedCount ?? 0,
    totalRows: payload.holdings.length,
    totalSteps: steps.length,
    currentStepIndex: 0,
    status: steps.length > 0 ? 'ready' : 'complete',
    allowedFields: [...ALLOWED_FIELDS],
    disallowedFields: [...DISALLOWED_FIELDS],
    steps,
  };
}

export function getCurrentTransferStep(session: TransferSession): TransferStep | null {
  return session.steps[session.currentStepIndex] ?? null;
}

export function advanceTransferSession(session: TransferSession): TransferSession {
  if (session.status === 'complete') return session;

  const nextStepIndex = Math.min(session.currentStepIndex + 1, session.totalSteps);
  return {
    ...session,
    currentStepIndex: nextStepIndex,
    status: nextStepIndex >= session.totalSteps ? 'complete' : 'in_progress',
  };
}

export function completeTransferSession(session: TransferSession): TransferSession {
  return {
    ...session,
    currentStepIndex: session.totalSteps,
    status: 'complete',
  };
}
