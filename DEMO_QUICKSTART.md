# Demo Quickstart (Windows-first)

This is the shortest path for a room demo of the local-only MVP.

## What you are showing
1. Load a holdings CSV locally.
2. Review eligible vs blocked rows.
3. Copy a reviewed eMoney transfer packet.
4. Paste once into the first target eMoney Holdings Ticker cell.
5. Verify the staged rows.
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
1. Click **Copy Batch for eMoney**.
2. Go to the correct eMoney Holdings page.
3. Click the first target **Ticker** cell.
4. Press **Ctrl+V** once.
5. Review every row visually.
6. Save manually only after review.

## Desktop shell
For the Windows-first desktop shell, run:

```cmd
npm run desktop:dev
```

The desktop app uses the same local static workflow inside Tauri/WebView2. It does not host eMoney, control Chrome, install an extension, run browser scripts, or use eMoney API access.

## Troubleshooting
- **`npm` cannot find `package.json`**: you are in the wrong folder. Open Command Prompt inside the repo folder.
- **`tsc` not recognized**: run `npm install` from the repo folder.
- **Port 8080 in use**: run `set PORT=8081` then `npm run start:demo`, and open `http://localhost:8081/`.
- **Clipboard blocked**: manually copy the TSV packet from the output panel.
- **Wrong first eMoney cell**: stop, undo/correct manually in eMoney, and paste again only after the right first Ticker cell is selected. The app does not click, type, or save inside eMoney.
