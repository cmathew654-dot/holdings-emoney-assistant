# Freeze Notes — `release/csv-mvp-freeze`

## Scope summary (current diff)
This freeze captures a local-only MVP that includes:

1. **Typed ingestion schema** (`holdings-schema.ts`)
   - Canonical file/account/holding/issue/run-log models
   - Review/entry lifecycle status fields

2. **CSV ingestion + validation** (`holdings-csv-parser.ts`)
   - Header-row detection + alias mapping
   - Unquoted thousands/currency repair
   - Row filtering (blank + subtotal/total)
   - Account grouping with stable account/holding IDs
   - Issue emission (`INVALID_FORMAT`, `DUPLICATE_HOLDING`, `UNMAPPED_ACCOUNT_TYPE`, etc.)
   - Top-level ingestion output (`HoldingsIngestionFile`)

3. **Review/export safety surface** (`review-export-surface.ts`)
   - Conservative eligibility rules (default block behavior)
   - Manual-review override handling
   - Preflight summary (eligible/blocked/warning-bearing + blocked reason codes)
   - Row-level blocked reason display synchronized with override state
   - Assistant payload export per account

4. **eMoney browser helper** (`emoney-browser-helper.ts`)
   - Row read/add/fill/upsert helpers targeting `#holdingsTable > tr`
   - No auto-save behavior
   - Ambiguous match hard-stop (`AMBIGUOUS_MATCH`) with human-intervention signal
   - Batch processing helper

5. **Entrypoint + docs**
   - `main.ts` local entrypoint wiring parser → review/export render
   - `README.md` engineer handoff overview
   - `OPERATOR_RUNBOOK.md` cautious internal operator instructions

6. **Tests + config**
   - `holdings-csv-parser.test.cjs`
   - `review-export-surface.test.cjs`
   - `emoney-browser-helper.test.cjs` (lightweight executable DOM-harness)
   - `package.json` test/typecheck scripts
   - `tsconfig.test.json`

---

## Safety posture in this freeze
- Local-only workflow
- No backend integration
- No auto-save
- Human-in-the-loop required
- Ambiguous row matching stops automatic update

---

## Intended use at freeze
- **Engineering handoff:** ready
- **Operator use:** cautious internal use with runbook discipline

---

## Out of scope / deferred
- PDF ingestion
- Extension packaging
- Polished production UI
- Full real-browser E2E automation suite
