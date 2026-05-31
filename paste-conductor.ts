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
