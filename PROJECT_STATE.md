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

It accepts a specific holdings CSV format, parses it locally, lets the operator review eligible and blocked rows, then prepares a reviewed eMoney Fill Packet for controlled row creation on the eMoney Holdings page.

The Fill Packet contains one row per eligible holding and approves exactly ticker, units, and cost basis. The operator clicks a bookmarklet Fill Button on the visible eMoney Holdings page, confirms the overlay, reviews every row, and clicks Save manually in eMoney.

## Current Demo Path

1. Save the spreadsheet as CSV UTF-8.
2. Run `npm run start:demo`.
3. Load the CSV in the local browser demo.
4. Review eligible and blocked rows.
5. Keep blocked rows excluded unless a human intentionally enables the supported override.
6. Install the Fill eMoney Holdings bookmark once if it is not already on the bookmarks bar.
7. Click Copy eMoney Fill Packet.
8. Open the correct eMoney Holdings page and click the Fill Button bookmark.
9. Confirm the overlay after checking account, row count, included fields, and excluded fields.
10. Review every row in eMoney.
11. Save manually only after review.

## Safety Invariants

- Local-only execution.
- No backend services.
- No external APIs for client data.
- No auto-save behavior.
- Human-in-the-loop review is required.
- Blocked rows remain excluded by default.
- Ambiguous browser-helper matches must hard-stop.
- Fill Button runs only when clicked by the operator, shows an in-page confirmation overlay, and never clicks Save.
- Fill Button prepares/fills ticker, units, and cost basis only.
- Market value is reconciliation-only because eMoney calculates value from shares/pricing.
- Asset class and sector are not manually overwritten by the Fill Button.
- Existing matching ticker/CUSIP values on the eMoney page hard-stop the Fill Button before row creation.

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
- The UI now supports a Regulated Ledger Fill Packet path, Fill Button bookmarklet setup, and manual spreadsheet paste fallback, with desktop packaging scaffolded but not yet treated as a signed production installer.
- Browser-helper confidence is based on local tests and the known eMoney Holdings screen behavior; the Fill Button depends on that page structure and hard-stops when expected controls are missing.
- The legacy DevTools snippet helper still exists for backward-compatible engineering tests, but it is no longer the primary operator path.

## Cleanup Already Completed

- Renamed `cmathew654-dot/auto` to `cmathew654-dot/holdings-emoney-assistant`.
- Archived the empty `cmathew654-dot/emoney-injector` placeholder.

## Optional Later Cleanup

1. Move or archive downloaded ZIP snapshots so they are not mistaken for working repos.
2. Decide later whether the larger local `holdings-transformer` workbench should be migrated into this repo or kept as a separate future project.
