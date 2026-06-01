# OPERATOR RUNBOOK (Local-Only MVP)

## Meaning of eligible vs blocked
- **Eligible**: holding can be included in export under current override setting.
- **Blocked**: holding is excluded from export under current override setting.

Default blocked reasons include:
- Missing both ticker and CUSIP.
- Any issue with `blocking=true`.
- Any issue with `severity='error'`.
- Manual-review-required issue codes when override is OFF:
  - `DUPLICATE_HOLDING`
  - `INVALID_FORMAT`
  - `UNMAPPED_ACCOUNT_TYPE`
  - `CASH_SPECIAL_HANDLING`
  - `ZERO_PRICE_NONZERO_VALUE_EXCEPTION`

## Override meaning
- Override **OFF** (recommended): conservative safe mode; manual-review-required holdings stay blocked.
- Override **ON**: allows export of holdings blocked only by manual-review-required codes.

Use override only after manual validation of identity/data correctness.

## What warnings / non-success mean
- Helper result `ok: false` means operation did not complete safely.
- `AMBIGUOUS_MATCH` means multiple rows matched candidate identifiers; stop and resolve manually.
- Warnings indicate non-fatal issues (including possible partial writes) and require manual verification.

## Spreadsheet / CSV prep
1. Open the spreadsheet in Excel.
2. Use **File → Save As → CSV UTF-8 (Comma delimited) (*.csv)**.
3. Run `npm run start:demo` and load that CSV with **Choose CSV File**.
4. Do not use `Last Updated` as acquisition date; it is statement/as-of context only.
5. Expect `$CASH$` rows and zero-price/nonzero-value rows to be blocked by default.

## Fill Button eMoney transfer flow
1. In the review/export UI, keep override OFF first.
2. Install the **Fill eMoney Holdings** bookmark once by dragging it to the browser bookmarks bar.
3. Click **Copy eMoney Fill Packet**.
4. Open the correct eMoney Holdings page.
5. Click the **Fill eMoney Holdings** bookmark.
6. In the overlay, click **Read Clipboard** or use the paste fallback.
7. Confirm only after checking the account number, row count, and excluded fields.
8. Review every staged row before saving.

The fill packet only approves ticker, units, and cost basis. Market value is for reconciliation only because eMoney calculates value. The Fill Button can click Add a Holding and fill approved fields after confirmation, but it must not click Save or write asset class, sector, description, or market value.

## Required manual verification steps
1. Confirm the correct account/context before export.
2. Review blocked reasons and issue list before enabling override.
3. After the Fill Button completes, verify each row-level value on page (identifier, units, cost basis, required fields).
4. Save manually only after verification is complete.

## What not to do
- Do not auto-save.
- Do not use browser extensions or eMoney API access for this workaround.
- Do not ignore warnings.
- Do not force through ambiguous matches.
- Do not manually overwrite asset class/sector unless explicitly intentional and policy-approved.
- Do not treat this MVP as unattended automation.
- Do not confirm the Fill Button overlay on the wrong account or page.
- Do not bypass a duplicate warning; resolve the eMoney page manually first.
