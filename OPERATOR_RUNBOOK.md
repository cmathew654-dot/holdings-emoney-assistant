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
3. Load that CSV in the local MVP.
4. Do not use `Last Updated` as acquisition date; it is statement/as-of context only.
5. Expect `$CASH$` rows and zero-price/nonzero-value rows to be blocked by default.

## eMoney snippet flow
1. In the review/export UI, keep override OFF first.
2. Click **Copy eMoney DevTools snippet (eligible holdings only)**.
3. Open the correct eMoney Holdings page.
4. Paste the snippet into Chrome/Edge DevTools Console.
5. The snippet may click **Add a Holding** and fill ticker, units, and cost basis. It must not click Save.

## Required manual verification steps
1. Confirm the correct account/context before export.
2. Review blocked reasons and issue list before enabling override.
3. After helper execution, verify row-level values on page (identifier, units, cost basis, required fields).
4. Save manually only after verification is complete.

## What not to do
- Do not auto-save.
- Do not ignore warnings.
- Do not force through ambiguous matches.
- Do not manually overwrite asset class/sector unless explicitly intentional and policy-approved.
- Do not treat this MVP as unattended automation.
