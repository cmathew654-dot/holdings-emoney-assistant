# AGENTS.md — Repository Operating Manual

## Project
**Holdings Transformer + eMoney Entry Assistant**

## Purpose
Provide a **local-only**, human-reviewed workflow to:
1. Parse custodial holdings CSV files into a structured model.
2. Review blocked/eligible holdings before export.
3. Produce assistant-ready payloads for browser-assisted entry in eMoney.

## Non-negotiable constraints
- Local-only execution.
- No backend services.
- No external APIs for client data.
- No auto-save behavior.
- Human-in-the-loop is required.
- Ambiguous browser-helper matches must hard-stop.
- Do not manually overwrite asset class/sector unless policy-approved and intentional.
- Review/export **row display**, **summary**, and **export eligibility** must stay synchronized.

## Current architecture/modules
- `holdings-schema.ts` — canonical data contracts.
- `holdings-csv-parser.ts` — CSV parse/normalize/issue emission.
- `review-export-surface.ts` — eligibility, preflight, review/export UI logic.
- `emoney-browser-helper.ts` — browser row read/match/fill/upsert helpers.
- `main.ts` — minimal local entry wiring.

## Safety invariants (must not break)
1. Manual intervention is required for ambiguous row matches (`AMBIGUOUS_MATCH`).
2. Default behavior is conservative: blocked holdings stay excluded unless operator explicitly overrides applicable manual-review codes.
3. Helper never clicks Save / never auto-persists final submission.
4. No client data leaves local runtime through new network integrations.
5. Preflight counts, row-level blocked status, and exported payload eligibility must remain aligned.

## Current maturity
- Engineering handoff ready.
- Cautious operator handoff ready.

## Explanation style requirement (after significant changes)
Use plain English for a non-developer/tinkerer audience, and always explain:
1. **What changed**
2. **What it actually does**
3. **Why it matters**
4. **Simple mental model**

## Branch discipline
- Treat `release/csv-mvp-freeze` as baseline.
- Use feature branches/worktrees for new work.
- Do not casually mutate the freeze branch.

## Preferred next-step order
1. Desktop verification of current MVP.
2. Packaging/entry shell polish.
3. Stronger browser-helper runtime confidence.
4. PDF planning.
5. PDF implementation later.

## Standard commands
- `npm test`
- `npm run typecheck`
