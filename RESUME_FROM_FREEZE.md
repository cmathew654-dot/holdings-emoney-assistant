# Resume From Freeze

## What is complete
- Local MVP parsing pipeline for holdings CSV.
- Review/export safety surface with conservative defaults.
- Browser helper for eMoney row matching/fill/upsert with ambiguity hard-stop.
- Baseline docs and tests supporting engineering/operator handoff.

## What is intentionally deferred
- PDF ingestion.
- Packaging polish.
- Full browser E2E-grade confidence suite.

## Exact next recommended task
Run a desktop verification pass of the existing end-to-end MVP flow and document any mismatch between parser output, review eligibility display, and helper write behavior.

## How to resume safely (short)
1. Start from `release/csv-mvp-freeze` baseline assumptions.
2. Run `npm test` and `npm run typecheck` before changing anything.
3. Preserve safety invariants (no auto-save, ambiguity hard-stop, synchronized eligibility surfaces).
4. Keep changes small and explain: what changed, what it does, why it matters, and mental model.
