# Project State

## Single Source Of Truth

The canonical source of truth is the GitHub repository `cmathew654-dot/holdings-emoney-assistant` on branch `main`.

The current canonical local clone is:

```text
C:\Users\Cyril\Projects\holdings-emoney-assistant
```

Do not use downloaded ZIP snapshots, such as `C:\Users\Cyril\Downloads\auto-main\auto-main`, as working directories.

## What This Project Is

This is a local-only Holdings Transformer + eMoney Entry Assistant.

It accepts a specific holdings CSV format, parses it locally, lets the operator review eligible and blocked rows, then prepares a guided clipboard conductor for visible human-paste entry on the eMoney Holdings page.

The guided conductor stages one approved value at a time for the operator to paste manually. The operator must review every row and click Save manually in eMoney.

## Current Demo Path

1. Save the spreadsheet as CSV UTF-8.
2. Run `npm run start:demo`.
3. Load the CSV in the local browser demo.
4. Review eligible and blocked rows.
5. Keep blocked rows excluded unless a human intentionally enables the supported override.
6. Click Prepare Guided eMoney Entry.
7. Copy one approved value at a time from the conductor.
8. Paste visibly into the correct eMoney Holdings field.
9. Review every row in eMoney.
10. Save manually only after review.

## Safety Invariants

- Local-only execution.
- No backend services.
- No external APIs for client data.
- No auto-save behavior.
- Human-in-the-loop review is required.
- Blocked rows remain excluded by default.
- Ambiguous browser-helper matches must hard-stop.
- Guided entry never clicks, types, controls the browser, injects scripts, or clicks Save.
- Guided entry prepares ticker, units, and cost basis only.
- Market value is reconciliation-only because eMoney calculates value from shares/pricing.
- Asset class and sector are not manually overwritten by guided entry.

## Branch Model

- `main`: stable, demo-ready source of truth.
- `release/csv-mvp-freeze`: historical frozen baseline if needed.
- `codex/<short-task-name>`: temporary work branches used for focused changes.
- Pull requests: required path into `main` unless the change is a narrow metadata/doc correction.
- Tags: use for named milestones such as `v0.1-csv-mvp` or `v0.2-demo-ready`.

Avoid a long-lived `develop` branch for now. It would add another place for state to diverge.

## What Is Not Canonical Right Now

- `C:\Users\Cyril\Downloads\auto-main\auto-main`: ZIP snapshot, not a real working repo.
- `cmathew654-dot/emoney-injector`: archived empty placeholder repo.
- `C:\Users\Cyril\Projects\holdings-transformer`: larger local lab/workbench with desktop and Playwright writer ideas; useful future work, but not the demo source of truth.

## Current Limitations

- Direct PDF ingestion is deferred.
- Direct XLSX runtime ingestion is deferred for the current demo path.
- The UI now supports a Regulated Ledger guided entry surface, with desktop packaging scaffolded but not yet treated as a signed production installer.
- Browser-helper confidence is based on local tests and the known eMoney Holdings screen behavior; the guided conductor avoids relying on browser injection for the primary workflow.
- The legacy DevTools snippet helper still exists for backward-compatible engineering tests, but it is no longer the primary operator path.

## Cleanup Already Completed

- Renamed `cmathew654-dot/auto` to `cmathew654-dot/holdings-emoney-assistant`.
- Archived the empty `cmathew654-dot/emoney-injector` placeholder.

## Optional Later Cleanup

1. Move or archive downloaded ZIP snapshots so they are not mistaken for working repos.
2. Decide later whether the larger local `holdings-transformer` workbench should be migrated into this repo or kept as a separate future project.
