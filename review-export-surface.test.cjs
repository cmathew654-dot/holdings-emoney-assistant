const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getHoldingEligibility,
  toAssistantPayloadForAccount,
  buildAccountPreflightSummary,
  getAccountRowDisplay,
  buildEmoneyDevtoolsSnippet,
} = require('./.test-dist/review-export-surface.js');

function issue(code, severity = 'warning', blocking = false) {
  return {
    code,
    severity,
    message: code,
    source: 'validation',
    blocking,
    createdAt: '2026-04-07T00:00:00Z',
  };
}

function holding(overrides = {}) {
  return {
    holdingId: 'acct-1-h-1',
    reviewStatus: 'in_review',
    entryStatus: 'queued',
    ticker: 'VTI',
    cusip: null,
    description: 'Vanguard',
    units: 10,
    costBasis: 100,
    marketValue: 110,
    acquisitionDate: '2024-01-01',
    excludeFromAA: null,
    issues: [],
    ...overrides,
  };
}

function account(holdings) {
  return {
    accountId: 'acct-1',
    accountNumber: '123',
    accountType: 'Taxable Brokerage',
    reviewStatus: 'in_review',
    entryStatus: 'not_started',
    issues: [],
    holdings,
  };
}

test('DUPLICATE_HOLDING blocks export by default', () => {
  const h = holding({ issues: [issue('DUPLICATE_HOLDING')] });
  assert.equal(getHoldingEligibility(h).eligible, false);
});

test('INVALID_FORMAT blocks export by default', () => {
  const h = holding({ issues: [issue('INVALID_FORMAT')] });
  assert.equal(getHoldingEligibility(h).eligible, false);
});

test('UNMAPPED_ACCOUNT_TYPE blocks export by default', () => {
  const h = holding({ issues: [issue('UNMAPPED_ACCOUNT_TYPE')] });
  assert.equal(getHoldingEligibility(h).eligible, false);
});

test('blocking=true issue blocks export', () => {
  const h = holding({ issues: [issue('VALIDATION_WARNING', 'warning', true)] });
  assert.equal(getHoldingEligibility(h).eligible, false);
});

test("severity='error' issue blocks export", () => {
  const h = holding({ issues: [issue('VALIDATION_WARNING', 'error', false)] });
  assert.equal(getHoldingEligibility(h).eligible, false);
});

test('explicit override allows export when only manual-review-required issues exist', () => {
  const h = holding({ issues: [issue('DUPLICATE_HOLDING')] });
  assert.equal(getHoldingEligibility(h).eligible, false);
  assert.equal(getHoldingEligibility(h, { allowManualOverride: true }).eligible, true);
});

test('preflight summary counts and blocked reasons are correct', () => {
  const a = account([
    holding(),
    holding({ holdingId: 'acct-1-h-2', issues: [issue('DUPLICATE_HOLDING')] }),
    holding({ holdingId: 'acct-1-h-3', issues: [issue('INVALID_FORMAT')] }),
    holding({ holdingId: 'acct-1-h-4', issues: [issue('VALIDATION_WARNING', 'warning', true)] }),
    holding({ holdingId: 'acct-1-h-5', issues: [issue('VALIDATION_WARNING', 'warning', false)] }),
  ]);

  const summary = buildAccountPreflightSummary(a);
  assert.equal(summary.eligibleCount, 2);
  assert.equal(summary.blockedCount, 3);
  assert.equal(summary.warningBearingCount, 4);
  assert.equal(summary.blockedReasonsByCode.DUPLICATE_HOLDING, 1);
  assert.equal(summary.blockedReasonsByCode.INVALID_FORMAT, 1);
  assert.equal(summary.blockedReasonsByCode.VALIDATION_WARNING, 1);

  const payload = toAssistantPayloadForAccount(a);
  assert.equal(payload.holdings.length, 2);
});


test('override off => row display shows blocked for manual-review-required issue', () => {
  const a = account([holding({ issues: [issue('DUPLICATE_HOLDING')] })]);
  const rows = getAccountRowDisplay(a);
  assert.equal(rows[0].eligible, false);
  assert.match(rows[0].blockedWhy, /manual review required/i);
});

test('override on => row display updates to eligible when only manual-review-required issue exists', () => {
  const a = account([holding({ issues: [issue('DUPLICATE_HOLDING')] })]);
  const rows = getAccountRowDisplay(a, { allowManualOverride: true });
  assert.equal(rows[0].eligible, true);
  assert.equal(rows[0].blockedWhy, 'n/a');
});

test('row display preserves market value for operator review', () => {
  const a = account([holding({ ticker: 'AAPL', marketValue: 3000 })]);
  const rows = getAccountRowDisplay(a);
  assert.equal(rows[0].marketValue, 3000);
  assert.equal(rows[0].holding.marketValue, 3000);
});


test('summary/export and row display stay aligned when override changes', () => {
  const a = account([
    holding({ holdingId: 'acct-1-h-1', issues: [issue('DUPLICATE_HOLDING')] }),
    holding({ holdingId: 'acct-1-h-2' }),
  ]);

  const rowsOff = getAccountRowDisplay(a);
  const summaryOff = buildAccountPreflightSummary(a);
  const payloadOff = toAssistantPayloadForAccount(a);
  assert.equal(rowsOff.filter((r) => r.eligible).length, summaryOff.eligibleCount);
  assert.equal(payloadOff.holdings.length, summaryOff.eligibleCount);

  const rowsOn = getAccountRowDisplay(a, { allowManualOverride: true });
  const summaryOn = buildAccountPreflightSummary(a, { allowManualOverride: true });
  const payloadOn = toAssistantPayloadForAccount(a, { allowManualOverride: true });
  assert.equal(rowsOn.filter((r) => r.eligible).length, summaryOn.eligibleCount);
  assert.equal(payloadOn.holdings.length, summaryOn.eligibleCount);
});


test('cash and zero-price exception issue codes block export by default', () => {
  const a = account([
    holding({ holdingId: 'acct-1-h-1', ticker: '$CASH$', issues: [issue('CASH_SPECIAL_HANDLING')] }),
    holding({ holdingId: 'acct-1-h-2', ticker: 'FSRNQ', issues: [issue('ZERO_PRICE_NONZERO_VALUE_EXCEPTION')] }),
    holding({ holdingId: 'acct-1-h-3', ticker: 'AAPL' }),
  ]);

  const summary = buildAccountPreflightSummary(a);
  assert.equal(summary.eligibleCount, 1);
  assert.equal(summary.blockedCount, 2);
  assert.equal(summary.blockedReasonsByCode.CASH_SPECIAL_HANDLING, 1);
  assert.equal(summary.blockedReasonsByCode.ZERO_PRICE_NONZERO_VALUE_EXCEPTION, 1);
  assert.deepEqual(toAssistantPayloadForAccount(a).holdings.map((h) => h.ticker), ['AAPL']);
});

test('buildEmoneyDevtoolsSnippet emits eligible rows as paste-ready eMoney fill script', () => {
  const payload = toAssistantPayloadForAccount(account([
    holding({ holdingId: 'acct-1-h-1', ticker: 'AAPL', units: 10, costBasis: 1450, marketValue: 3000 }),
    holding({ holdingId: 'acct-1-h-2', ticker: '$CASH$', units: 0, costBasis: 0, issues: [issue('CASH_SPECIAL_HANDLING')] }),
  ]));

  const snippet = buildEmoneyDevtoolsSnippet(payload);
  assert.match(snippet, /eMoney holdings fill snippet generated locally/);
  assert.match(snippet, /Add a Holding/i);
  assert.match(snippet, /ticker": "AAPL"/);
  assert.match(snippet, /units": "10"/);
  assert.match(snippet, /costBasis": "1450"/);
  assert.match(snippet, /marketValue": "3000"/);
  assert.match(snippet, /Reference market value/);
  assert.doesNotMatch(snippet, /MarketValueTextBox/);
  assert.doesNotMatch(snippet, /setValue\(fields\.marketValue, row\.marketValue\)/);
  assert.doesNotThrow(() => new Function(snippet));
  assert.doesNotMatch(snippet, /\$CASH\$/);
  assert.doesNotMatch(snippet, /"assetClass"|"sector"|fields\.assetClass|fields\.sector/);
  assert.doesNotMatch(snippet, /save[^\n;]*\.click/i);
});
