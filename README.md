# Holdings Transformer + eMoney Entry Assistant (Local MVP)

## What this project does
This repo implements a local, human-reviewed workflow to:
1. Parse custodial holdings CSV files exported from a spreadsheet.
2. Review holdings and issues with conservative export gating.
3. Export eligible holdings as JSON or prepare a one-paste eMoney transfer packet.
4. Conduct eMoney entry with one reviewed tab-delimited clipboard packet without browser scripting, browser extensions, API access, or auto-save.

## Current modules
- `holdings-schema.ts` - canonical file/account/holding/issue contracts.
- `holdings-csv-parser.ts` - CSV ingestion, normalization, issue generation, account grouping.
- `review-export-surface.ts` - eligibility logic, preflight summaries, Regulated Ledger review UI, batch transfer preparation, and legacy eMoney snippet generation.
- `paste-conductor.ts` - batch clipboard transfer model plus legacy guided step model for fallback tests.
- `ledger-styles.ts` - Regulated Ledger UI styling shared by the browser demo and desktop shell.
- `emoney-browser-helper.ts` - row discovery, matching, upsert/fill helpers, ambiguity hard-stop.
- `main.ts` - local entrypoint.
- `*.test.cjs` - executable tests for parser/review/conductor/helper behavior.

## Spreadsheet to CSV without breaking values
For the current spreadsheet shape, use Excel **Save As -> CSV UTF-8 (Comma delimited) (*.csv)**.

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
- `$CASH$`/Cash rows and zero-price/nonzero-value rows are blocked from eMoney public-security entry by default.

## End-to-end workflow
1. Save/export the spreadsheet as CSV UTF-8.
2. Parse CSV into `HoldingsIngestionFile`.
3. Review account/holding issues in the review/export surface.
4. Keep override OFF by default; turn ON only after manual validation.
5. Click **Copy Batch for eMoney** for eligible holdings only.
6. In eMoney, open the correct Holdings page.
7. Click the first target Ticker cell and press Ctrl+V once.
8. Manually verify page values and then save manually.

## Safety model
- Local-only.
- No backend.
- No external APIs for client data.
- No auto-save.
- Human-in-the-loop required.
- Ambiguous row matches hard-stop (`AMBIGUOUS_MATCH`).
- Batch transfer prepares ticker, units, and cost basis only; market value is shown for reconciliation only because eMoney calculates value from shares/pricing.
- Batch transfer does not click, type, inject scripts, control the browser, or click Save.
- Row display + summary + export eligibility must remain synchronized.

## Commands
- `npm run start:demo`
  - Builds the local static demo and serves it at `http://localhost:8080/`.
- `npm run build:demo`
  - Builds `demo-dist/` without starting the server.
- `npm run desktop:dev`
  - Builds the local static workflow and opens the Windows-first Tauri/WebView2 desktop shell.
- `npm run desktop:build`
  - Builds the local static workflow and packages the Tauri desktop app.
- `npm test`
  - Type-checks test-targeted TS and runs parser/review/conductor/helper tests.
- `npm run typecheck`
  - Runs no-emit TS check for core MVP modules.

## Current readiness status
- Engineering handoff: ready.
- Cautious operator handoff: ready with runbook discipline.
- Stakeholder demo path: CSV -> review/export -> copy one transfer packet -> paste once visibly into eMoney -> manual verification/save.

## Known limitations / deferred items
- Direct PDF ingestion is deferred.
- Direct XLSX runtime ingestion is not required for the current demo path; convert spreadsheet output to CSV UTF-8 first.
- UI now has a Regulated Ledger review/export shell and one-paste transfer packet; signed production desktop distribution is still future work.
- Legacy eMoney snippet/helper code remains for engineering fallback and tests, but DevTools is no longer the primary operator path.
- Browser-helper tests use a lightweight fake DOM harness, not full browser E2E.
- Packaging is available as a local static browser demo and scaffolded Tauri/WebView2 desktop shell; no signed installer yet.

## Likely next engineering tasks
1. Desktop verification pass of current CSV -> one-paste transfer packet -> eMoney manual-save flow.
2. Signed packaging/installer polish for repeatable local usage.
3. Stronger runtime-confidence checks if the legacy injected path remains available.
4. Optional direct XLSX intake after the demo path is stable.
5. PDF planning later.
