# Holdings Transformer + eMoney Entry Assistant (Local MVP)

## 1) What this project does
This repo provides a local-only workflow to:
1. Parse custodial holdings CSV files into a structured ingestion model.
2. Review holdings/issues and export assistant-ready payloads per account.
3. Use a browser-injected helper to populate eMoney holding rows with human oversight.

---

## 2) Current modules in this repo
- `holdings-schema.ts` — canonical types for ingestion file/account/holding/issues/run log.
- `holdings-csv-parser.ts` — CSV parsing + normalization + issue generation + account bucketing.
- `review-export-surface.ts` — eligibility/preflight logic + minimal DOM review/export surface.
- `emoney-browser-helper.ts` — browser helper for row matching/add/fill/upsert in eMoney DOM.
- `holdings-csv-parser.test.cjs` — parser unit tests.
- `review-export-surface.test.cjs` — review/export logic tests.
- `emoney-browser-helper.test.cjs` — executable lightweight DOM-harness tests for core helper safety paths.
- `OPERATOR_RUNBOOK.md` — cautious internal operator runbook.

---

## 3) End-to-end architecture
1. **Schema layer**
   - `HoldingsIngestionFile` contains accounts/holdings/issues/runLog.
2. **CSV parser layer**
   - Detects header row + aliases, repairs unquoted thousands separators, normalizes fields, groups accounts, emits issues.
3. **Validation layer**
   - Flags parse/format issues, duplicate heuristics, unmapped account types, subtotal/total rows, etc.
4. **Review/export layer**
   - Computes eligibility, supports explicit override for selected manual-review issue codes, provides preflight summary, exports account payloads.
5. **Browser helper layer**
   - Reads/fills eMoney rows, upserts holdings, hard-stops on ambiguous match (requires manual intervention).

---

## 4) Safety model
- Local-only workflow.
- No backend in this repo.
- No auto-save behavior in helper.
- Human-in-the-loop required for review and final save.
- Ambiguous row match in helper is a hard stop (`AMBIGUOUS_MATCH`).

---

## 5) Test / typecheck commands
- `npm test`
  - Runs `tsc -p tsconfig.test.json`
  - Runs `node --test holdings-csv-parser.test.cjs review-export-surface.test.cjs emoney-browser-helper.test.cjs`
- `npm run typecheck`
  - Runs `tsc --noEmit --lib es2019 holdings-schema.ts holdings-csv-parser.ts`

---

## 6) Current readiness status
- **Engineering handoff:** ready.
- **Operator handoff:** ready for cautious internal use (with runbook/process discipline).

---

## 7) Known limitations / deferred items
- PDF ingestion is not implemented.
- Operator UI is intentionally minimal (internal MVP, not polished product UI).
- Browser helper tests use a lightweight fake DOM harness; this is not identical to full real-browser behavior.

---

## 8) Most likely next engineering tasks
1. Add a small real-browser or jsdom-based helper integration test pass for deeper DOM fidelity.
2. Add a minimal app shell/entrypoint to wire parser -> review/export -> helper in one local operator flow.
3. Expand operator diagnostics (explicit warning banners/history for partial writes and overrides).
4. Add lightweight packaging/docs for reproducible local execution setup.
