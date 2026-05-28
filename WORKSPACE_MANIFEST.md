# Workspace Manifest

- `AGENTS.md` — durable repo-level operating manual for Codex threads.
- `README.md` — engineering overview, workflow, safety model, readiness, and commands.
- `OPERATOR_RUNBOOK.md` — safe operator usage instructions.
- `ENGINEERING_HANDOFF_CHECKLIST.md` — engineer onboarding and safety checklist.
- `FREEZE_NOTES.md` — frozen scope, deferred scope, and safe next workstreams.
- `RESUME_FROM_FREEZE.md` — quick rehydration guide for new windows/threads.
- `freeze_notes.md` — legacy freeze-notes filename retained from earlier snapshot.
- `main.ts` — local entrypoint wiring parser to review/export surface.
- `holdings-schema.ts` — canonical ingestion/account/holding/issue model types.
- `holdings-csv-parser.ts` — CSV parsing, normalization, issue emission, account grouping.
- `review-export-surface.ts` — eligibility logic, summary, and UI rendering for review/export.
- `emoney-browser-helper.ts` — browser helper for holdings table read/match/fill/upsert.
- `holdings-csv-parser.test.cjs` — parser behavior tests.
- `review-export-surface.test.cjs` — review/export behavior tests.
- `emoney-browser-helper.test.cjs` — helper behavior tests via lightweight DOM harness.
- `package.json` — scripts/dependencies for test and typecheck.
- `tsconfig.test.json` — TypeScript config used in test flow.
