# Demo Quickstart (Windows-first)

This is the shortest path for a room demo of the local-only MVP.

## What you are showing
1. Load a holdings CSV locally.
2. Review eligible vs blocked rows.
3. Prepare a guided eMoney entry session.
4. Copy one approved value at a time from the local conductor.
5. Paste visibly into the correct eMoney Holdings fields.
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
1. Click **Prepare Guided eMoney Entry**.
2. Go to the correct eMoney Holdings page.
3. In the local tool, click **Copy Next Value**.
4. Paste that value into the visible eMoney field named by the conductor.
5. Click **Mark Step Complete** only after pasting and visually checking the field.
6. Repeat until the conductor says the session is complete.
7. Review every row visually.
8. Save manually only after review.

## Desktop shell
For the Windows-first desktop shell, run:

```cmd
npm run desktop:dev
```

The desktop app uses the same local static workflow inside Tauri/WebView2. It does not host eMoney, control Chrome, install an extension, or use eMoney API access.

## Troubleshooting
- **`npm` cannot find `package.json`**: you are in the wrong folder. Open Command Prompt inside the repo folder.
- **`tsc` not recognized**: run `npm install` from the repo folder.
- **Port 8080 in use**: run `set PORT=8081` then `npm run start:demo`, and open `http://localhost:8081/`.
- **Clipboard blocked**: manually copy the current value from the conductor's next-value panel.
- **Wrong eMoney field**: stop the session and correct manually. The app does not click, type, or save inside eMoney.
