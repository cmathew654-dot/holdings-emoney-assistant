const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPasteConductorSession,
  getCurrentTransferStep,
  advanceTransferSession,
  completeTransferSession,
} = require('./.test-dist/paste-conductor.js');

function payload(holdings) {
  return {
    accountId: 'acct-1',
    accountNumber: '123456789',
    accountType: 'Taxable Brokerage',
    holdings,
  };
}

function holding(overrides = {}) {
  return {
    ticker: 'AAPL',
    cusip: null,
    description: 'Apple Incorporated',
    units: 10,
    costBasis: 1450,
    marketValue: 3000,
    ...overrides,
  };
}

test('buildPasteConductorSession creates only human-paste steps for eligible holdings', () => {
  const session = buildPasteConductorSession(payload([
    holding({ ticker: 'AAPL', units: 10, costBasis: 1450, marketValue: 3000 }),
    holding({ ticker: 'MSFT', units: 5, costBasis: 1800, marketValue: 2500 }),
  ]), { blockedCount: 2 });

  assert.equal(session.accountNumber, '123456789');
  assert.equal(session.blockedCount, 2);
  assert.equal(session.totalRows, 2);
  assert.equal(session.totalSteps, 6);
  assert.equal(session.currentStepIndex, 0);
  assert.equal(session.status, 'ready');
  assert.deepEqual(session.allowedFields, ['ticker', 'units', 'costBasis']);
  assert.deepEqual(session.disallowedFields, ['marketValue', 'assetClass', 'sector', 'save']);
  assert.deepEqual(session.steps.map((step) => step.fieldName), [
    'ticker',
    'units',
    'costBasis',
    'ticker',
    'units',
    'costBasis',
  ]);
  assert.deepEqual(session.steps.map((step) => step.clipboardValue), [
    'AAPL',
    '10',
    '1450',
    'MSFT',
    '5',
    '1800',
  ]);
  assert(session.steps.every((step) => step.operatorInstruction.includes('Paste into eMoney')));
});

test('buildPasteConductorSession never creates market value, asset class, sector, or save steps', () => {
  const session = buildPasteConductorSession(payload([
    holding({ ticker: 'AAPL', units: 10, costBasis: 1450, marketValue: 3000 }),
  ]));

  const serializedSteps = JSON.stringify(session.steps);
  assert.doesNotMatch(serializedSteps, /assetClass|sector|save/i);
  assert.equal(session.steps.some((step) => step.fieldName === 'marketValue'), false);
  assert.equal(session.steps.some((step) => step.clipboardValue === '3000'), false);
});

test('transfer session advances predictably and completes manually', () => {
  const session = buildPasteConductorSession(payload([
    holding({ ticker: 'AAPL', units: 10, costBasis: 1450 }),
  ]));

  assert.equal(getCurrentTransferStep(session).clipboardValue, 'AAPL');

  const afterTicker = advanceTransferSession(session);
  assert.equal(afterTicker.currentStepIndex, 1);
  assert.equal(afterTicker.status, 'in_progress');
  assert.equal(getCurrentTransferStep(afterTicker).fieldName, 'units');

  const afterUnits = advanceTransferSession(afterTicker);
  assert.equal(afterUnits.currentStepIndex, 2);
  assert.equal(getCurrentTransferStep(afterUnits).fieldName, 'costBasis');

  const afterBasis = advanceTransferSession(afterUnits);
  assert.equal(afterBasis.currentStepIndex, 3);
  assert.equal(afterBasis.status, 'complete');
  assert.equal(getCurrentTransferStep(afterBasis), null);

  const completed = completeTransferSession(afterUnits);
  assert.equal(completed.currentStepIndex, 3);
  assert.equal(completed.status, 'complete');
});

test('empty transfer session stays complete and copy-safe', () => {
  const session = buildPasteConductorSession(payload([]), { blockedCount: 3 });

  assert.equal(session.totalRows, 0);
  assert.equal(session.totalSteps, 0);
  assert.equal(session.blockedCount, 3);
  assert.equal(session.status, 'complete');
  assert.equal(getCurrentTransferStep(session), null);
  assert.deepEqual(advanceTransferSession(session), session);
});
