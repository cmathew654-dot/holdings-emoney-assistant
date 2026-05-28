# Engineering Handoff Checklist

## Modules and ownership boundaries
- `holdings-schema.ts`: data contracts and lifecycle/status typing.
- `holdings-csv-parser.ts`: ingest/normalize/issue emission and account/holding grouping.
- `review-export-surface.ts`: eligibility + synchronized row/summary/export behavior.
- `emoney-browser-helper.ts`: browser row matching/fill/upsert safety behavior.
- `main.ts`: local wiring/example entry flow.

## First commands to run
1. `npm install`
2. `npm test`
3. `npm run typecheck`

## Safety behaviors that must not break
- Ambiguous helper match must hard-stop (`AMBIGUOUS_MATCH`).
- No auto-save behavior.
- Default conservative export blocking must remain intact.
- Manual override must be explicit and only affect manual-review-required codes.
- Review rows, preflight summary, and export payload eligibility must remain synchronized.
- No new external API/backend dependency for client data.

## Risky files (edit carefully)
- `holdings-csv-parser.ts` (normalization + issue semantics can shift downstream behavior).
- `review-export-surface.ts` (eligibility and operator-facing safety cues).
- `emoney-browser-helper.ts` (DOM matching + fill semantics + ambiguity handling).
- `holdings-schema.ts` (contract changes ripple through all modules/tests/docs).

## First-hour onboarding checklist
- [ ] Read `README.md` for system workflow and constraints.
- [ ] Read `AGENTS.md` for repo-level non-negotiables and branch discipline.
- [ ] Read `OPERATOR_RUNBOOK.md` for operator safety language.
- [ ] Read `FREEZE_NOTES.md` and `RESUME_FROM_FREEZE.md` for frozen scope + next recommended work.
- [ ] Run tests/typecheck and confirm green baseline.
- [ ] Make one small docs-only edit and re-run tests to confirm local setup.
