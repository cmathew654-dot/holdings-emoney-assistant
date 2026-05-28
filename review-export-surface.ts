import { AccountRecord, HoldingRecord, HoldingsIngestionFile, Issue } from './holdings-schema';
import { BrowserHoldingInput } from './emoney-browser-helper';

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
    }));

  return `// eMoney holdings fill snippet generated locally for account ${payload.accountNumber}.
// Paste this into Chrome/Edge DevTools on the correct eMoney Holdings page.
// Safety: clicks Add a Holding and fills ticker, units, and cost basis only. It NEVER clicks Save.
(async () => {
  const rows = ${JSON.stringify(rows, null, 2)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const nearby = fields.slice(start, start + 12);
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
  }

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
    };
  });
}

function formatIssues(issues: Issue[]): string {
  if (!issues.length) return 'none';
  return issues.map((i) => `${i.severity.toUpperCase()}:${i.code}${i.field ? ` (${i.field})` : ''}`).join(', ');
}

/**
 * Renders a minimal review table and export action per account.
 *
 * The export button writes assistant-ready payload JSON to the output panel,
 * and returns it through optional callback.
 */
export function renderReviewExportSurface(
  root: HTMLElement,
  ingestion: HoldingsIngestionFile,
  opts?: { onExport?: (payload: AssistantAccountPayload) => void }
): void {
  root.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = 'Holdings Review / Export (Local-Only)';
  root.appendChild(title);

  const fileSummary = document.createElement('p');
  fileSummary.textContent = `Accounts: ${ingestion.accounts.length} | File Issues: ${ingestion.issues.length}`;
  root.appendChild(fileSummary);

  const output = document.createElement('pre');
  output.textContent = 'Assistant payload output will appear here...';
  output.style.whiteSpace = 'pre-wrap';
  output.style.border = '1px solid #ccc';
  output.style.padding = '8px';
  root.appendChild(output);

  ingestion.accounts.forEach((account) => {
    const accountWrap = document.createElement('section');
    accountWrap.style.margin = '12px 0';
    accountWrap.style.padding = '8px';
    accountWrap.style.border = '1px solid #ddd';

    const header = document.createElement('h3');
    header.textContent = `${account.accountNumber} (${account.accountType})`;
    accountWrap.appendChild(header);

    const accountIssues = document.createElement('p');
    accountIssues.textContent = `Account Issues: ${formatIssues(account.issues)}`;
    accountWrap.appendChild(accountIssues);

    const overrideLabel = document.createElement('label');
    overrideLabel.style.display = 'block';
    overrideLabel.style.margin = '6px 0';
    const overrideInput = document.createElement('input');
    overrideInput.type = 'checkbox';
    overrideInput.style.marginRight = '6px';
    overrideLabel.appendChild(overrideInput);
    overrideLabel.appendChild(document.createTextNode('Override safety gate for manual-review-required codes (use carefully)'));
    accountWrap.appendChild(overrideLabel);

    const overrideState = document.createElement('p');
    overrideState.textContent = 'Override: OFF (recommended). Blocked holdings stay excluded.';
    accountWrap.appendChild(overrideState);

    const preflight = document.createElement('p');
    accountWrap.appendChild(preflight);

    const renderSummary = () => {
      const summary = buildAccountPreflightSummary(account, { allowManualOverride: overrideInput.checked });
      const blockedReasonText = Object.keys(summary.blockedReasonsByCode).length
        ? JSON.stringify(summary.blockedReasonsByCode)
        : '{}';
      preflight.textContent = `Preflight summary: ${summary.eligibleCount} eligible, ${summary.blockedCount} blocked, ${summary.warningBearingCount} warning-bearing holdings. Blocked reason counts: ${blockedReasonText}`;
      overrideState.textContent = overrideInput.checked
        ? 'Override: ON. Manual-review-required holdings may be exported.'
        : 'Override: OFF (recommended). Blocked holdings stay excluded.';
    };

    overrideInput.onchange = () => {
      renderSummary();
      renderRows();
    };

    const table = document.createElement('table');
    table.style.width = '100%';
    table.border = '1';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Eligible</th><th>Ticker</th><th>CUSIP</th><th>Units</th><th>Cost Basis</th><th>Blocked Why</th><th>Issues</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const renderRows = () => {
      tbody.innerHTML = '';
      const rowDisplay = getAccountRowDisplay(account, { allowManualOverride: overrideInput.checked });
      rowDisplay.forEach(({ holding, eligible, blockedWhy }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = [
          `<td>${eligible ? 'Eligible ✅' : 'Blocked ⛔'}</td>`,
          `<td>${holding.ticker ?? ''}</td>`,
          `<td>${holding.cusip ?? ''}</td>`,
          `<td>${holding.units ?? ''}</td>`,
          `<td>${holding.costBasis ?? ''}</td>`,
          `<td>${blockedWhy}</td>`,
          `<td>${formatIssues(holding.issues)}</td>`,
        ].join('');
        tbody.appendChild(tr);
      });
    };
    table.appendChild(tbody);
    accountWrap.appendChild(table);

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export assistant payload (eligible holdings only)';
    exportBtn.onclick = () => {
      const payload = toAssistantPayloadForAccount(account, {
        allowManualOverride: overrideInput.checked,
      });
      output.textContent = JSON.stringify(payload, null, 2);
      opts?.onExport?.(payload);
    };
    accountWrap.appendChild(exportBtn);

    const snippetBtn = document.createElement('button');
    snippetBtn.textContent = 'Copy eMoney DevTools snippet (eligible holdings only)';
    snippetBtn.style.marginLeft = '8px';
    snippetBtn.onclick = () => {
      const payload = toAssistantPayloadForAccount(account, {
        allowManualOverride: overrideInput.checked,
      });
      const snippet = buildEmoneyDevtoolsSnippet(payload);
      output.textContent = snippet;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(snippet).catch(() => {
          // Some local-file/browser contexts block clipboard writes; output panel remains copyable.
        });
      }
    };
    accountWrap.appendChild(snippetBtn);

    renderSummary();
    renderRows();
    root.appendChild(accountWrap);
  });
}

/** Example usage:
 * const root = document.getElementById('app')!;
 * renderReviewExportSurface(root, parsedIngestionFile);
 */
