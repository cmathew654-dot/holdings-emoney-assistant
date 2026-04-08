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
]);

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
    reasons.push('missing ticker/cusip');
    blockedIssueCodes.push('MISSING_LOOKUP_KEY');
  }

  const blockingIssues = holding.issues.filter(isBlockingIssue);
  if (blockingIssues.length) {
    blockingIssues.forEach((i) => blockedIssueCodes.push(i.code));
    reasons.push(`blocking issues: ${blockingIssues.map((i) => i.code).join(', ')}`);
  }

  const manualReviewIssues = holding.issues.filter((i) => MANUAL_REVIEW_REQUIRED_CODES.has(i.code));
  const requiresManualOverride = manualReviewIssues.length > 0;
  if (requiresManualOverride && !opts?.allowManualOverride) {
    manualReviewIssues.forEach((i) => blockedIssueCodes.push(i.code));
    reasons.push(`manual review required: ${manualReviewIssues.map((i) => i.code).join(', ')}`);
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
    overrideLabel.appendChild(document.createTextNode('Allow manual-review override codes in export'));
    accountWrap.appendChild(overrideLabel);

    const overrideState = document.createElement('p');
    overrideState.textContent = 'Override: OFF (default safe mode)';
    accountWrap.appendChild(overrideState);

    const preflight = document.createElement('p');
    accountWrap.appendChild(preflight);

    const renderSummary = () => {
      const summary = buildAccountPreflightSummary(account, { allowManualOverride: overrideInput.checked });
      const blockedReasonText = Object.keys(summary.blockedReasonsByCode).length
        ? JSON.stringify(summary.blockedReasonsByCode)
        : '{}';
      preflight.textContent = `Preflight — eligible: ${summary.eligibleCount}, blocked: ${summary.blockedCount}, warning-bearing: ${summary.warningBearingCount}, blocked reasons: ${blockedReasonText}`;
      overrideState.textContent = `Override: ${overrideInput.checked ? 'ON' : 'OFF (default safe mode)'}`;
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
          `<td>${eligible ? 'yes' : 'blocked'}</td>`,
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
    exportBtn.textContent = 'Export assistant payload for account';
    exportBtn.onclick = () => {
      const payload = toAssistantPayloadForAccount(account, {
        allowManualOverride: overrideInput.checked,
      });
      output.textContent = JSON.stringify(payload, null, 2);
      opts?.onExport?.(payload);
    };
    accountWrap.appendChild(exportBtn);

    renderSummary();
    renderRows();
    root.appendChild(accountWrap);
  });
}

/** Example usage:
 * const root = document.getElementById('app')!;
 * renderReviewExportSurface(root, parsedIngestionFile);
 */
