# Holdings Transformer + eMoney Entry Assistant (Local MVP)

## What this project does
This repo implements a local, human-reviewed workflow to:
1. Parse custodial holdings CSV files exported from a spreadsheet.
2. Review holdings and issues with conservative export gating.
3. Export eligible holdings as JSON or as a paste-ready eMoney DevTools snippet.
4. Fill eMoney holding rows locally in the browser without clicking Save.

## Current modules
- `holdings-schema.ts` — canonical file/account/holding/issue contracts.
- `holdings-csv-parser.ts` — CSV ingestion, normalization, issue generation, account grouping.
- `review-export-surface.ts` — eligibility logic, preflight summaries, minimal review/export UI, eMoney snippet generation.
- `emoney-browser-helper.ts` — row discovery, matching, upsert/fill helpers, ambiguity hard-stop.
- `main.ts` — minimal local entrypoint.
- `*.test.cjs` — executable tests for parser/review/helper behavior.

## Spreadsheet to CSV without breaking values
For the current spreadsheet shape, use Excel **Save As → CSV UTF-8 (Comma delimited) (*.csv)**.

Expected useful headers include:
- `Account Number`
- `Symbol`
- `Description`
- `Quantity`
- `Price`
- `Cost Basis`
- `Value`
- `Asset Class`

Notes:
- Keep account numbers as text if leading zeros matter.
- Excel should quote values with commas, such as `$18,735.88` or `1,080.71444`; the parser also has a small repair path for common unquoted thousands separators.
- `Last Updated` is treated as statement/as-of context only; it is **not** mapped as acquisition date.
- `$CASH$`/Cash rows and zero-price/nonzero-value rows are blocked from eMoney public-security snippet export by default.

## End-to-end workflow
1. Save/export the spreadsheet as CSV UTF-8.
2. Parse CSV into `HoldingsIngestionFile`.
3. Review account/holding issues in review/export surface.
4. Keep override OFF by default; turn ON only after manual validation.
5. Copy either the account payload JSON or the **eMoney DevTools snippet** for eligible holdings only.
6. In eMoney, open the correct Holdings page, paste the snippet in DevTools Console, and let it add/fill rows.
7. Manually verify page values and then save manually.

## Safety model
- Local-only.
- No backend.
- No external APIs for client data.
- No auto-save.
- Human-in-the-loop required.
- Ambiguous row matches hard-stop (`AMBIGUOUS_MATCH`).
- Snippet fills ticker, units, and cost basis; market value is shown for reconciliation only because eMoney calculates value from shares/pricing.
- Row display + summary + export eligibility must remain synchronized.

## Commands
- `npm test`
  - Type-checks test-targeted TS and runs parser/review/helper tests.
- `npm run typecheck`
  - Runs no-emit TS check for core MVP modules.

## Current readiness status
- Engineering handoff: ready.
- Cautious operator handoff: ready (with runbook discipline).
- Stakeholder demo path: CSV → review/export → copy eMoney snippet → paste once into eMoney → manual verification/save.

## Known limitations / deferred items
- Direct PDF ingestion is deferred.
- Direct XLSX runtime ingestion is not required for the current demo path; convert spreadsheet output to CSV UTF-8 first.
- UI is intentionally minimal (internal MVP).
- eMoney snippet uses the discovered WebForms row order for the current Holdings screen; verify on a safe/test account before real use.
- Browser-helper tests use a lightweight fake DOM harness (not full browser E2E).
- Packaging/distribution shell is minimal.

## Likely next engineering tasks
1. Desktop verification pass of current CSV → snippet → eMoney MVP flow.
2. Packaging/entry shell polish for repeatable local usage.
3. Stronger runtime-confidence checks for browser helper behavior in real browser conditions.
4. Optional direct XLSX intake after the demo path is stable.
5. PDF planning later.
