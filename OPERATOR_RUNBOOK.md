# OPERATOR RUNBOOK (Local-Only MVP)

## 1) What this tool does
This MVP helps you:
1. Parse holdings CSV files into a structured local review model.
2. Review holdings/issues and export assistant-ready payloads per account.
3. Use a browser helper to fill eMoney holding rows with human oversight.

It is designed for **cautious internal use**, not unattended automation.

---

## 2) Preconditions before use
- **Local-only workflow**: run locally; do not transmit client data externally.
- **No auto-save**: helper does not click Save for you.
- **Human-in-the-loop required**: you must review blocked/warning conditions before export and entry.

---

## 3) End-to-end operator flow
1. **Parse CSV** into ingestion output.
2. **Review accounts/holdings** in review/export surface.
3. **Interpret blocked vs eligible** rows.
4. Confirm **override OFF vs ON** intent.
5. **Export assistant-ready payload** for one account.
6. In eMoney, run browser helper with that payload.
7. Review helper result and manually verify in-page values.
8. Save only after manual validation.

---

## 4) Default blocked semantics (override OFF)
A holding is blocked by default when any of the following is true:
- Missing lookup key (`ticker` and `cusip` both missing).
- Any issue has `blocking=true`.
- Any issue has `severity='error'`.
- Any issue code is in manual-review-required set:
  - `DUPLICATE_HOLDING`
  - `INVALID_FORMAT`
  - `UNMAPPED_ACCOUNT_TYPE`

---

## 5) When override is allowed
Override means: include holdings that are blocked **only** due manual-review-required codes.

Use override only when:
- You have manually validated the specific holding(s), and
- You are confident the match/input is intentional.

Do **not** use override when:
- You cannot confidently reconcile ticker/CUSIP/security identity,
- Errors indicate unresolved data ambiguity,
- You are rushing past warnings.

---

## 6) What helper results mean
- **Success (`ok: true`)**: helper completed requested write path.
- **Non-success (`ok: false`)**: operation did not complete safely.
- **Ambiguous match** (`reasonCode: AMBIGUOUS_MATCH`): helper found multiple candidate rows; manual intervention required.
- **Warnings**: non-fatal issues (e.g., disabled or missing fields).
- **Partial-write warnings**: some values may not have been written; treat as needing manual check.

---

## 7) Required manual verification steps
### Before export
- Confirm account is correct.
- Review blocked reasons and issue list.
- Confirm override setting intentionally matches your decision.

### Before running helper
- Confirm you are in the correct eMoney account/context.
- Confirm payload account/holdings correspond to current page.
- Confirm no unresolved ambiguity remains.

### After helper execution
- Check returned `ok/errors/warnings`.
- Validate row-level values in eMoney (identifier, units, cost basis, any required fields).
- If ambiguity or warnings occurred, resolve manually before save.

---

## 8) What not to do
- Do **not** auto-save.
- Do **not** ignore warnings blindly.
- Do **not** manually override asset class/sector unless intentional and policy-approved.

---

## 9) Known limitations
- Review UI is minimal and intended for internal MVP use.
- Browser-helper tests use a fake DOM harness; behavior is not identical to full browser runtime.
- Tool is for **cautious internal use only**.

---

## 10) Troubleshooting (quick)
- **Holding unexpectedly blocked**: inspect blocked reason text and issue codes; check override state.
- **Export has fewer holdings than expected**: blocked holdings are excluded by default; verify preflight summary.
- **Helper returns AMBIGUOUS_MATCH**: stop and manually identify correct row; do not force update blindly.
- **Helper succeeded but values look incomplete**: inspect warnings for partial writes; fix manually before save.
- **Add row failed**: verify eMoney page state and “Add a Holding” control visibility/selectors.
