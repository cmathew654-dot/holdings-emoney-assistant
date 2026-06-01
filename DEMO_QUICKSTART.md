# Demo Quickstart (Windows-first)

This is the shortest path for a room demo of the local-only MVP.

## What you are showing
1. Load a holdings CSV locally.
2. Review eligible vs blocked rows.
3. Copy a reviewed eMoney Fill Packet.
4. Click the Fill eMoney Holdings bookmark on the correct eMoney Holdings page.
5. Confirm the visible overlay so the helper adds rows and fills approved fields.
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
1. Drag **Fill eMoney Holdings** from the Fill Packet panel to the browser bookmarks bar once.
2. Click **Copy eMoney Fill Packet**.
3. Go to the correct eMoney Holdings page.
4. Click the **Fill eMoney Holdings** bookmark.
5. Click **Read Clipboard** in the overlay, or use the paste fallback if Chrome blocks clipboard read.
6. Confirm fill only after checking the account/row count in the overlay.
7. Review every row visually.
8. Save manually only after review.

## Desktop shell
For the Windows-first desktop shell, run:

```cmd
npm run desktop:dev
```

The desktop app uses the same local static workflow inside Tauri/WebView2. It does not host eMoney, install an extension, run a backend, or use eMoney API access. The Fill Button runs only when the operator clicks the bookmark on the visible eMoney Holdings page.

## Troubleshooting
- **`npm` cannot find `package.json`**: you are in the wrong folder. Open Command Prompt inside the repo folder.
- **`tsc` not recognized**: run `npm install` from the repo folder.
- **Port 8080 in use**: run `set PORT=8081` then `npm run start:demo`, and open `http://localhost:8081/`.
- **Clipboard blocked**: open **Session report**, manually copy the JSON fill packet, then paste it into the Fill Button overlay.
- **Wrong page/account**: close the overlay, open the correct eMoney Holdings page, and rerun the Fill Button before confirming.
- **Duplicate detected**: stop. The Fill Button intentionally fills nothing when an existing page ticker/CUSIP matches the packet.
