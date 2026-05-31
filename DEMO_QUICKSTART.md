# Demo Quickstart (Windows-first)

This is the shortest path for a room demo of the local-only MVP.

## What you are showing
1. Load a holdings CSV locally.
2. Review eligible vs blocked rows.
3. Copy an eMoney fill snippet.
4. Paste it into eMoney DevTools on the correct Holdings page.
5. Watch eMoney stage ticker, units, and cost basis.
6. Review manually. Save manually only if appropriate.

## Prerequisites
- Node.js LTS installed.
- The repo folder is on your machine.
- Your spreadsheet has been saved as **CSV UTF-8 (Comma delimited)**.
- eMoney is open in Chrome/Edge on the correct account's Holdings page.

## Start the local tool
Open Command Prompt in the repo folder, not `C:\Windows\System32`.

```cmd
npm install
npm run start:demo
```

Open the printed URL, usually:

```text
http://localhost:8080/
```

## Load data
- Click **Choose CSV File** and pick your CSV.
- Or click **Load Demo Sample** for a safe built-in sample.

## Review
- Keep override **OFF** first.
- Confirm eligible rows are normal public securities.
- Confirm blocked rows, like cash or exception rows, stay excluded.
- Market value is shown for reconciliation only; eMoney calculates value.

## Export for eMoney
1. Click **Copy eMoney Fill Snippet**.
2. If the browser says clipboard copy was blocked, manually copy the snippet from the output panel.
3. Go to the correct eMoney Holdings page.
4. Open DevTools Console.
5. Paste the snippet and press Enter.
6. Confirm the account prompt.
7. Let the snippet fill rows.
8. Review every row visually.
9. Save manually only after review.

## Troubleshooting
- **`npm` cannot find `package.json`**: you are in the wrong folder. Open Command Prompt inside the repo folder.
- **`tsc` not recognized**: run `npm install` from the repo folder.
- **Port 8080 in use**: run `set PORT=8081` then `npm run start:demo`, and open `http://localhost:8081/`.
- **Clipboard blocked**: manually copy from the output panel.
- **eMoney does not fill rows**: stop and verify you are on the correct Holdings page with the Add a Holding control visible.
