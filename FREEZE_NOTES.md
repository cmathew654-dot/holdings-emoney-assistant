# FREEZE_NOTES — `release/csv-mvp-freeze`

## What is frozen/included
- Typed ingestion schema (`holdings-schema.ts`).
- CSV parsing/normalization/issue emission (`holdings-csv-parser.ts`).
- Review/export eligibility + preflight + UI surface (`review-export-surface.ts`).
- eMoney browser helper with ambiguity hard-stop and no auto-save (`emoney-browser-helper.ts`).
- Minimal entrypoint/docs/tests (`main.ts`, `README.md`, `OPERATOR_RUNBOOK.md`, test files).

## What is deferred
- PDF ingestion.
- Packaging/polished app shell.
- Full real-browser E2E automation suite.
- Production-grade UI polish.

## Safety invariants
- Local-only, no backend, no external APIs for client data.
- Human-in-the-loop required.
- Ambiguous helper matches must hard-stop.
- No auto-save behavior.
- Review row status, preflight summary, and export eligibility remain aligned.

## Known limitations
- Minimal MVP UI.
- Helper tests rely on lightweight fake DOM harness.
- Manual operational discipline is required for safe usage.

## Next safe workstreams
1. Desktop verification of current MVP.
2. Packaging/entry shell polish.
3. Stronger browser-helper runtime confidence checks.
4. PDF planning.
5. PDF implementation later.
