import type { AccountRecord, HoldingRecord, HoldingsIngestionFile, Issue } from './holdings-schema';
import type { BrowserHoldingInput } from './emoney-browser-helper';
import {
  advanceTransferSession,
  buildPasteConductorSession,
  completeTransferSession,
  getCurrentTransferStep,
  type TransferSession,
} from './paste-conductor';

/**
 * Minimal review/export surface for internal local-only workflow.
 * - No styling framework
 * - Human-in-the-loop: only prepares payloads; does not auto-send or auto-save
 */

export interface AssistantAccountPayload {
  accountId: string;
  accountNumber: string;
  accountType: string;
  holdings: BrowserHoldingInput[];
}

export interface HoldingEligibility {
  eligible: boolean;
  reasons: string[];
  blockedIssueCodes: string[];
  requiresManualOverride: boolean;
}

export interface AccountPreflightSummary {
  eligibleCount: number;
  blockedCount: number;
  warningBearingCount: number;
  blockedReasonsByCode: Record<string, number>;
}

export interface AccountRowDisplayItem {
  holding: HoldingRecord;
  eligible: boolean;
  blockedWhy: string;
  marketValue: number | null;
}

export const MANUAL_REVIEW_REQUIRED_CODES = new Set<Issue['code']>([
  'DUPLICATE_HOLDING',
  'INVALID_FORMAT',
  'UNMAPPED_ACCOUNT_TYPE',
  'CASH_SPECIAL_HANDLING',
  'ZERO_PRICE_NONZERO_VALUE_EXCEPTION',
]);


function toFriendlyIssueLabel(code: string): string {
  switch (code) {
    case 'DUPLICATE_HOLDING':
      return 'possible duplicate holding';
    case 'INVALID_FORMAT':
      return 'invalid field format';
    case 'UNMAPPED_ACCOUNT_TYPE':
      return 'unmapped account type';
    case 'CASH_SPECIAL_HANDLING':
      return 'cash row requires manual handling';
    case 'ZERO_PRICE_NONZERO_VALUE_EXCEPTION':
      return 'zero price with nonzero value';
    case 'MISSING_LOOKUP_KEY':
      return 'missing ticker/CUSIP lookup key';
    default:
      return code.toLowerCase().replace(/_/g, ' ');
  }
}

function isBlockingIssue(issue: Issue): boolean {
  return Boolean(issue.blocking) || issue.severity === 'error';
}

export function getHoldingEligibility(
  holding: HoldingRecord,
  opts?: { allowManualOverride?: boolean }
): HoldingEligibility {
  const reasons: string[] = [];
  const blockedIssueCodes: string[] = [];

  const hasLookupKey = Boolean((holding.ticker ?? '').trim() || (holding.cusip ?? '').trim());
  if (!hasLookupKey) {
    reasons.push('blocked: missing ticker/CUSIP lookup key');
    blockedIssueCodes.push('MISSING_LOOKUP_KEY');
  }

  const blockingIssues = holding.issues.filter(isBlockingIssue);
  if (blockingIssues.length) {
    blockingIssues.forEach((i) => blockedIssueCodes.push(i.code));
    reasons.push(`blocked: ${blockingIssues.map((i) => toFriendlyIssueLabel(i.code)).join(', ')}`);
  }

  const manualReviewIssues = holding.issues.filter((i) => MANUAL_REVIEW_REQUIRED_CODES.has(i.code));
  const requiresManualOverride = manualReviewIssues.length > 0;
  if (requiresManualOverride && !opts?.allowManualOverride) {
    manualReviewIssues.forEach((i) => blockedIssueCodes.push(i.code));
    reasons.push(`manual review required before export: ${manualReviewIssues.map((i) => toFriendlyIssueLabel(i.code)).join(', ')}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    blockedIssueCodes: Array.from(new Set(blockedIssueCodes)),
    requiresManualOverride,
  };
}

export function isHoldingEligible(holding: HoldingRecord, opts?: { allowManualOverride?: boolean }): boolean {
  return getHoldingEligibility(holding, opts).eligible;
}

export function toAssistantHolding(holding: HoldingRecord): BrowserHoldingInput {
  return {
    ticker: holding.ticker ?? null,
    cusip: holding.cusip ?? null,
    description: holding.description ?? null,
    units: holding.units ?? null,
    costBasis: holding.costBasis ?? null,
    marketValue: holding.marketValue ?? null,
  };
}

export function buildAccountPreflightSummary(
  account: AccountRecord,
  opts?: { allowManualOverride?: boolean }
): AccountPreflightSummary {
  const blockedReasonsByCode: Record<string, number> = {};
  let eligibleCount = 0;
  let blockedCount = 0;

  for (const holding of account.holdings) {
    const eligibility = getHoldingEligibility(holding, opts);
    if (eligibility.eligible) {
      eligibleCount += 1;
    } else {
      blockedCount += 1;
      eligibility.blockedIssueCodes.forEach((code) => {
        blockedReasonsByCode[code] = (blockedReasonsByCode[code] ?? 0) + 1;
      });
    }
  }

  const warningBearingCount = account.holdings.filter((h) => h.issues.some((i) => i.severity === 'warning')).length;

  return {
    eligibleCount,
    blockedCount,
    warningBearingCount,
    blockedReasonsByCode,
  };
}

export function toAssistantPayloadForAccount(
  account: AccountRecord,
  opts?: { allowManualOverride?: boolean }
): AssistantAccountPayload {
  const eligible = account.holdings
    .filter((h) => isHoldingEligible(h, opts))
    .map(toAssistantHolding);

  return {
    accountId: account.accountId,
    accountNumber: account.accountNumber,
    accountType: account.accountType,
    holdings: eligible,
  };
}


export function buildEmoneyDevtoolsSnippet(payload: AssistantAccountPayload): string {
  const rows = payload.holdings
    .filter((holding) => (holding.ticker ?? '').trim())
    .map((holding) => ({
      ticker: String(holding.ticker ?? '').trim(),
      units: holding.units == null ? '' : String(holding.units),
      costBasis: holding.costBasis == null ? '' : String(holding.costBasis),
      marketValue: holding.marketValue == null ? '' : String(holding.marketValue),
    }));

  return `// eMoney holdings fill snippet generated locally for account ${payload.accountNumber}.
// Paste this into Chrome/Edge DevTools on the correct eMoney Holdings page.
// Safety: clicks Add a Holding and fills ticker, units, and cost basis only. It NEVER clicks Save.
// Market value stays in the row data for operator reconciliation; eMoney calculates value from shares/pricing.
(async () => {
  const rows = ${JSON.stringify(rows, null, 2)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const confirmed = window.confirm('Confirm you are on the correct eMoney Holdings page for account ${payload.accountNumber}. This will fill eligible rows but will NOT click Save.');
  if (!confirmed) {
    console.warn('eMoney fill cancelled before any row changes.');
    return;
  }
  const results = [];

  function visible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function fire(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function setValue(el, value) {
    el.focus();
    el.value = String(value);
    fire(el);
  }

  function visibleInputs() {
    return [...document.querySelectorAll('input')]
      .filter((el) => visible(el) && !el.disabled && !el.readOnly);
  }

  function findAddHoldingButton() {
    return [...document.querySelectorAll('button, a, input[type="button"], input[type="submit"]')]
      .find((el) => {
        const text = \`${'${el.textContent || \'\'} ${el.value || \'\'}'}\`.trim().toLowerCase();
        return text.includes('add a holding');
      });
  }

  async function clickAddHolding() {
    const button = findAddHoldingButton();
    if (!button) throw new Error('Could not find Add a Holding button. Stop and enter manually.');
    const before = visibleInputs().length;
    button.click();

    for (let i = 0; i < 20; i += 1) {
      await sleep(250);
      if (visibleInputs().length > before) return;
    }

    console.warn('Clicked Add a Holding, but did not detect additional inputs. Continuing cautiously.');
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
    // Discovered eMoney WebForms row order for the current Holdings screen:
    // 0 Ticker, 1 CUSIP, 2 Description, 3 Date Acquired, 4 Units, 5 Cost Basis.
    return {
      ticker: nearby[0],
      units: nearby[4],
      costBasis: nearby[5],
    };
  }

  console.log('Starting eMoney holdings fill. This will NOT click Save.', rows);

  for (const [index, row] of rows.entries()) {
    console.log(\`Adding row ${'${index + 1}'}/${'${rows.length}'}\`, row);
    try {
      await clickAddHolding();
      await sleep(500);

      const tickerEl = newestTickerField();
      if (!tickerEl) throw new Error('Could not find the newest Ticker field. Stop and enter manually.');

      const fields = rowFieldsFromTicker(tickerEl);
      if (!fields.units) throw new Error('Could not locate Units field by discovered row offset. Stop and enter manually.');
      if (!fields.costBasis) throw new Error('Could not locate Cost Basis field by discovered row offset. Stop and enter manually.');

      setValue(fields.ticker, row.ticker);
      await sleep(1200); // let eMoney resolve description / asset class / sector from ticker
      setValue(fields.units, row.units);
      setValue(fields.costBasis, row.costBasis);

      results.push({
        row: index + 1,
        ticker: row.ticker,
        units: row.units,
        costBasis: row.costBasis,
        referenceMarketValue: row.marketValue || '(none)',
        status: 'filled',
        message: 'Ticker, units, and cost basis filled. Market value not filled; eMoney calculates it.',
      });
    } catch (err) {
      results.push({
        row: index + 1,
        ticker: row.ticker,
        units: row.units,
        costBasis: row.costBasis,
        referenceMarketValue: row.marketValue || '(none)',
        status: 'failed',
        message: err instanceof Error ? err.message : String(err),
      });
      console.error('Stopped on row failure. Review manually.', err);
      break;
    }
  }

  console.table(results);
  console.log('Done. Review every row visually. Save remains manual.');
})();`;
}


export function getAccountRowDisplay(
  account: AccountRecord,
  opts?: { allowManualOverride?: boolean }
): AccountRowDisplayItem[] {
  return account.holdings.map((holding) => {
    const eligibility = getHoldingEligibility(holding, opts);
    return {
      holding,
      eligible: eligibility.eligible,
      blockedWhy: eligibility.reasons.join('; ') || 'n/a',
      marketValue: holding.marketValue ?? null,
    };
  });
}

function formatIssues(issues: Issue[]): string {
  if (!issues.length) return 'none';
  return issues.map((i) => `${i.severity.toUpperCase()}:${i.code}${i.field ? ` (${i.field})` : ''}`).join(', ');
}

function makeButton(label: string, className = 'ledger-button'): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
}

function appendCell(row: HTMLTableRowElement, text: string): void {
  const cell = document.createElement('td');
  cell.textContent = text;
  row.appendChild(cell);
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function buildTransferReport(session: TransferSession): string {
  const lines = [
    'Guided eMoney Entry Session Report',
    `Account: ${session.accountNumber} (${session.accountType})`,
    `Eligible rows prepared: ${session.totalRows}`,
    `Blocked rows excluded: ${session.blockedCount}`,
    `Steps completed: ${Math.min(session.currentStepIndex, session.totalSteps)} of ${session.totalSteps}`,
    '',
    'Safety boundary:',
    '- Human-paste clipboard conductor only.',
    '- No browser extension.',
    '- No DevTools snippet.',
    '- No auto-keystrokes.',
    '- No eMoney Save action.',
    '- No market value, asset class, or sector paste steps.',
    '',
    'Prepared steps:',
  ];

  session.steps.forEach((step, index) => {
    const status = index < session.currentStepIndex ? 'complete' : 'pending';
    lines.push(`${index + 1}. Row ${step.rowNumber} ${step.fieldLabel}: ${step.clipboardValue} [${status}]`);
  });

  return lines.join('\n');
}

function downloadSessionReport(session: TransferSession): void {
  const blob = new Blob([buildTransferReport(session)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `emoney-guided-entry-${session.accountNumber}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function renderReviewExportSurface(
  root: HTMLElement,
  ingestion: HoldingsIngestionFile,
  opts?: { onExport?: (payload: AssistantAccountPayload) => void }
): void {
  root.innerHTML = '';
  root.className = 'review-root';

  const overall = ingestion.accounts.reduce(
    (acc, account) => {
      const summary = buildAccountPreflightSummary(account);
      acc.eligible += summary.eligibleCount;
      acc.blocked += summary.blockedCount;
      acc.warningBearing += summary.warningBearingCount;
      acc.holdings += account.holdings.length;
      return acc;
    },
    { eligible: 0, blocked: 0, warningBearing: 0, holdings: 0 }
  );

  const heading = document.createElement('section');
  heading.className = 'review-heading';
  const headingCopy = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = 'Review ledger';
  headingCopy.appendChild(title);
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Eligible rows can be conducted into eMoney one clipboard value at a time. Blocked rows stay excluded unless the operator intentionally enables the supported override.';
  headingCopy.appendChild(subtitle);
  heading.appendChild(headingCopy);
  root.appendChild(heading);

  const safetyBanner = document.createElement('div');
  safetyBanner.className = 'safety-banner';
  safetyBanner.textContent = 'Safety boundary: this workflow prepares clipboard values only. The operator pastes visibly in eMoney and saves manually.';
  root.appendChild(safetyBanner);

  const metrics = document.createElement('section');
  metrics.className = 'metric-strip';
  [
    ['Accounts', String(ingestion.accounts.length)],
    ['Eligible', String(overall.eligible)],
    ['Blocked', String(overall.blocked)],
    ['Warnings', String(overall.warningBearing + ingestion.issues.length)],
  ].forEach(([label, value]) => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    metrics.appendChild(card);
  });
  root.appendChild(metrics);

  const output = document.createElement('pre');
  output.className = 'output-panel';
  output.textContent = 'Session output appears here after an operator action.';
  root.appendChild(output);

  ingestion.accounts.forEach((account) => {
    const accountWrap = document.createElement('section');
    accountWrap.className = 'account-panel';

    const accountHeader = document.createElement('div');
    accountHeader.className = 'account-header';
    const accountHeaderCopy = document.createElement('div');
    const header = document.createElement('h3');
    header.textContent = `${account.accountNumber} (${account.accountType})`;
    accountHeaderCopy.appendChild(header);

    const accountIssues = document.createElement('p');
    accountIssues.textContent = `Account Issues: ${formatIssues(account.issues)}`;
    accountHeaderCopy.appendChild(accountIssues);
    accountHeader.appendChild(accountHeaderCopy);
    accountWrap.appendChild(accountHeader);

    const overrideLabel = document.createElement('label');
    overrideLabel.className = 'override-row';
    const overrideInput = document.createElement('input');
    overrideInput.type = 'checkbox';
    overrideLabel.appendChild(overrideInput);
    overrideLabel.appendChild(document.createTextNode('Override safety gate for manual-review-required codes (use carefully)'));
    accountWrap.appendChild(overrideLabel);

    const preflight = document.createElement('p');
    accountWrap.appendChild(preflight);

    const table = document.createElement('table');
    table.className = 'holdings-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Status</th><th>Ticker</th><th>CUSIP</th><th>Units</th><th>Cost Basis</th><th>Market Value</th><th>Blocked Why</th><th>Issues</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    const tableWrap = document.createElement('div');
    tableWrap.className = 'holdings-table-wrap';
    tableWrap.appendChild(table);
    accountWrap.appendChild(tableWrap);

    const transferPanel = document.createElement('section');
    transferPanel.className = 'transfer-panel';
    transferPanel.hidden = true;
    accountWrap.appendChild(transferPanel);

    let activeSession: TransferSession | null = null;

    const renderRows = () => {
      tbody.innerHTML = '';
      const rowDisplay = getAccountRowDisplay(account, { allowManualOverride: overrideInput.checked });
      rowDisplay.forEach(({ holding, eligible, blockedWhy }) => {
        const tr = document.createElement('tr');
        tr.className = eligible ? 'row-eligible' : 'row-blocked';

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge ${eligible ? 'ok' : 'bad'}`;
        badge.textContent = eligible ? 'Eligible' : 'Blocked';
        statusCell.appendChild(badge);
        tr.appendChild(statusCell);

        appendCell(tr, holding.ticker ?? '');
        appendCell(tr, holding.cusip ?? '');
        appendCell(tr, holding.units == null ? '' : String(holding.units));
        appendCell(tr, holding.costBasis == null ? '' : String(holding.costBasis));
        appendCell(tr, holding.marketValue == null ? '' : String(holding.marketValue));
        appendCell(tr, blockedWhy);
        appendCell(tr, formatIssues(holding.issues));
        tbody.appendChild(tr);
      });
    };

    const renderSummary = () => {
      const summary = buildAccountPreflightSummary(account, { allowManualOverride: overrideInput.checked });
      const blockedReasonText = Object.keys(summary.blockedReasonsByCode).length
        ? JSON.stringify(summary.blockedReasonsByCode)
        : '{}';
      preflight.className = `preflight ${summary.blockedCount > 0 ? 'blocked' : 'clean'}`;
      preflight.textContent = overrideInput.checked
        ? `Override ON: ${summary.eligibleCount} eligible, ${summary.blockedCount} blocked. Blocked reason counts: ${blockedReasonText}`
        : `Override OFF: ${summary.eligibleCount} eligible, ${summary.blockedCount} blocked. Blocked reason counts: ${blockedReasonText}`;
    };

    const renderTransferSession = () => {
      if (!activeSession) {
        transferPanel.hidden = true;
        return;
      }

      transferPanel.hidden = false;
      transferPanel.innerHTML = '';
      const currentStep = getCurrentTransferStep(activeSession);
      const completedSteps = Math.min(activeSession.currentStepIndex, activeSession.totalSteps);
      const pct = activeSession.totalSteps === 0 ? 100 : Math.round((completedSteps / activeSession.totalSteps) * 100);

      const layout = document.createElement('div');
      layout.className = 'transfer-grid';

      const left = document.createElement('div');
      const panelTitle = document.createElement('h3');
      panelTitle.textContent = activeSession.status === 'complete' ? 'Guided entry complete' : 'Guided eMoney entry';
      left.appendChild(panelTitle);

      const summary = document.createElement('p');
      summary.textContent = `${activeSession.totalRows} eligible rows prepared. ${activeSession.blockedCount} blocked rows excluded. ${completedSteps} of ${activeSession.totalSteps} paste steps complete.`;
      left.appendChild(summary);

      const progress = document.createElement('div');
      progress.className = 'progress-track';
      const progressFill = document.createElement('span');
      progressFill.className = 'progress-fill';
      progressFill.style.width = `${pct}%`;
      progress.appendChild(progressFill);
      left.appendChild(progress);

      const boundary = document.createElement('p');
      boundary.innerHTML = '<span class="badge info">Manual boundary</span> This panel copies values only. It does not click, type, control the browser, or save in eMoney.';
      left.appendChild(boundary);

      const copyState = document.createElement('p');
      copyState.className = 'transfer-copy-state';
      copyState.textContent = currentStep
        ? currentStep.operatorInstruction
        : 'Review the eMoney page one final time. Save remains manual.';
      left.appendChild(copyState);

      const stepActions = document.createElement('div');
      stepActions.className = 'ledger-actions';

      const copyBtn = makeButton('Copy Next Value');
      copyBtn.disabled = !currentStep;
      copyBtn.onclick = async () => {
        if (!currentStep) return;
        const copied = await copyTextToClipboard(currentStep.clipboardValue);
        copyState.textContent = copied
          ? `Copied ${currentStep.fieldLabel} for row ${currentStep.rowNumber}. Paste it visibly in eMoney, then mark complete.`
          : `Clipboard copy was blocked. Manually copy this value: ${currentStep.clipboardValue}`;
      };
      stepActions.appendChild(copyBtn);

      const doneBtn = makeButton('Mark Step Complete', 'ledger-button secondary');
      doneBtn.disabled = !currentStep;
      doneBtn.onclick = () => {
        if (!activeSession) return;
        activeSession = advanceTransferSession(activeSession);
        renderTransferSession();
      };
      stepActions.appendChild(doneBtn);

      const completeBtn = makeButton('Finish Session', 'ledger-button ghost');
      completeBtn.disabled = activeSession.status === 'complete';
      completeBtn.onclick = () => {
        if (!activeSession) return;
        activeSession = completeTransferSession(activeSession);
        renderTransferSession();
      };
      stepActions.appendChild(completeBtn);

      const reportBtn = makeButton('Export Session Report', 'ledger-button ghost');
      reportBtn.onclick = () => {
        if (!activeSession) return;
        output.textContent = buildTransferReport(activeSession);
        downloadSessionReport(activeSession);
      };
      stepActions.appendChild(reportBtn);
      left.appendChild(stepActions);

      const right = document.createElement('aside');
      right.className = 'next-value';
      if (currentStep) {
        const value = document.createElement('strong');
        value.textContent = currentStep.clipboardValue || '(blank)';
        right.innerHTML = '<span>Next paste</span>';
        right.appendChild(value);
        const row = document.createElement('p');
        row.textContent = `Row ${currentStep.rowNumber}: ${currentStep.fieldLabel}`;
        right.appendChild(row);
        const ticker = document.createElement('p');
        ticker.textContent = currentStep.ticker;
        right.appendChild(ticker);
      } else {
        right.innerHTML = '<span>Status</span><strong>Complete</strong><p>All prepared clipboard steps are complete.</p>';
      }

      layout.appendChild(left);
      layout.appendChild(right);
      transferPanel.appendChild(layout);
    };

    overrideInput.onchange = () => {
      activeSession = null;
      renderSummary();
      renderRows();
      renderTransferSession();
    };

    const actions = document.createElement('div');
    actions.className = 'account-actions';

    const exportBtn = makeButton('Export JSON Payload', 'ledger-button ghost');
    exportBtn.onclick = () => {
      const payload = toAssistantPayloadForAccount(account, {
        allowManualOverride: overrideInput.checked,
      });
      output.textContent = `Exported JSON payload for ${payload.holdings.length} eligible holdings.\n\n${JSON.stringify(payload, null, 2)}`;
      opts?.onExport?.(payload);
    };
    actions.appendChild(exportBtn);

    const conductorBtn = makeButton('Prepare Guided eMoney Entry');
    conductorBtn.onclick = () => {
      const payload = toAssistantPayloadForAccount(account, {
        allowManualOverride: overrideInput.checked,
      });
      const summary = buildAccountPreflightSummary(account, {
        allowManualOverride: overrideInput.checked,
      });
      activeSession = buildPasteConductorSession(payload, { blockedCount: summary.blockedCount });
      output.textContent = [
        `Prepared guided eMoney entry for ${activeSession.totalRows} eligible holdings.`,
        `Blocked holdings excluded: ${activeSession.blockedCount}.`,
        'Next: open the correct eMoney Holdings page, click Copy Next Value, paste visibly, and mark each step complete.',
        'Safety: this flow never opens DevTools, never injects a script, never controls the browser, and never clicks Save.',
      ].join('\n');
      opts?.onExport?.(payload);
      renderTransferSession();
    };
    actions.appendChild(conductorBtn);
    accountWrap.appendChild(actions);

    renderSummary();
    renderRows();
    root.appendChild(accountWrap);
  });
}

/** Example usage:
 * const root = document.getElementById('app')!;
 * renderReviewExportSurface(root, parsedIngestionFile);
 */
