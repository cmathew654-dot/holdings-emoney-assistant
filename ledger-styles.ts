const STYLE_ID = 'regulated-ledger-style';

export function installRegulatedLedgerStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --ledger-ink: #1b1a17;
      --ledger-muted: #746c5d;
      --ledger-paper: #f7f1e6;
      --ledger-paper-strong: #fffaf0;
      --ledger-line: #d8c9ad;
      --ledger-rule: #b99d67;
      --ledger-green: #276b53;
      --ledger-green-soft: #e7f2eb;
      --ledger-red: #9f3a32;
      --ledger-red-soft: #f8e9e4;
      --ledger-blue: #2f6675;
      --ledger-blue-soft: #e4eff1;
      --ledger-shadow: 0 24px 80px rgba(76, 56, 24, 0.14);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background:
        linear-gradient(90deg, rgba(88, 71, 40, 0.045) 1px, transparent 1px) 0 0 / 34px 34px,
        radial-gradient(circle at 16% 8%, rgba(185, 157, 103, 0.22), transparent 28%),
        linear-gradient(140deg, #fbf7ef, var(--ledger-paper) 54%, #efe4d1);
      color: var(--ledger-ink);
      font-family: "Aptos", "Segoe UI", sans-serif;
    }

    .ledger-shell {
      width: min(1440px, calc(100vw - 40px));
      margin: 0 auto;
      padding: 32px 0 44px;
    }

    .ledger-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 24px;
      align-items: end;
      padding: 26px 0 22px;
    }

    .ledger-kicker {
      color: var(--ledger-green);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 12px;
      margin: 0 0 10px;
    }

    .ledger-title {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: clamp(34px, 4.2vw, 64px);
      line-height: 0.96;
      letter-spacing: 0;
      margin: 0;
      max-width: 880px;
    }

    .ledger-subtitle {
      max-width: 740px;
      color: var(--ledger-muted);
      font-size: 16px;
      line-height: 1.55;
      margin: 18px 0 0;
    }

    .ledger-assurance {
      background: rgba(255, 250, 240, 0.82);
      border: 1px solid var(--ledger-line);
      box-shadow: var(--ledger-shadow);
      padding: 18px;
      border-radius: 8px;
    }

    .ledger-assurance strong {
      display: block;
      margin-bottom: 8px;
      font-size: 15px;
    }

    .ledger-assurance span {
      display: block;
      color: var(--ledger-muted);
      line-height: 1.5;
      font-size: 14px;
    }

    .ledger-panel {
      background: rgba(255, 250, 240, 0.88);
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      box-shadow: var(--ledger-shadow);
      padding: 18px;
    }

    .ledger-load-panel {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: center;
      margin-bottom: 22px;
    }

    .ledger-panel h2,
    .ledger-panel h3 {
      font-family: "Georgia", "Times New Roman", serif;
      letter-spacing: 0;
      margin: 0;
    }

    .ledger-panel h2 { font-size: 24px; }
    .ledger-panel h3 { font-size: 21px; }

    .ledger-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .ledger-button {
      appearance: none;
      border: 1px solid #866f43;
      background: #2c261c;
      color: #fffaf0;
      border-radius: 6px;
      padding: 10px 14px;
      font-weight: 800;
      letter-spacing: 0;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .ledger-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(44, 38, 28, 0.22);
    }

    .ledger-button.secondary {
      background: #fffaf0;
      color: var(--ledger-ink);
    }

    .ledger-button.ghost {
      background: transparent;
      color: var(--ledger-ink);
      border-color: var(--ledger-line);
    }

    .ledger-button:disabled {
      cursor: not-allowed;
      opacity: 0.52;
      transform: none;
      box-shadow: none;
    }

    .ledger-file-input {
      max-width: 280px;
      color: var(--ledger-muted);
    }

    .ledger-status-line {
      margin: 12px 0 0;
      color: var(--ledger-muted);
      min-height: 24px;
    }

    .ledger-checks {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin: 18px 0 0;
    }

    .ledger-check {
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.42);
    }

    .ledger-check span {
      color: var(--ledger-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 800;
    }

    .ledger-check strong {
      display: block;
      margin-top: 6px;
      font-size: 14px;
    }

    .review-root {
      display: grid;
      gap: 18px;
    }

    .review-heading {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: end;
      margin-top: 6px;
    }

    .review-heading h2 {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 30px;
      margin: 0;
    }

    .review-heading p {
      margin: 8px 0 0;
      color: var(--ledger-muted);
      max-width: 780px;
      line-height: 1.5;
    }

    .metric-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .metric-card {
      background: rgba(255, 250, 240, 0.86);
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      padding: 14px;
    }

    .metric-card span {
      color: var(--ledger-muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .metric-card strong {
      display: block;
      font-size: 28px;
      margin-top: 4px;
      font-family: "Georgia", "Times New Roman", serif;
    }

    .safety-banner {
      border: 1px solid #ceb57e;
      background: #fff7df;
      border-radius: 8px;
      padding: 14px 16px;
      color: #51452e;
      font-weight: 700;
    }

    .account-panel {
      background: rgba(255, 250, 240, 0.92);
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      box-shadow: var(--ledger-shadow);
      overflow: hidden;
    }

    .account-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      padding: 18px;
      border-bottom: 1px solid var(--ledger-line);
      background: linear-gradient(180deg, #fffaf0, #f6eedf);
    }

    .account-header p {
      color: var(--ledger-muted);
      margin: 8px 0 0;
    }

    .override-row {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 18px;
      background: #f9f1df;
      border-bottom: 1px solid var(--ledger-line);
      color: #584d39;
      font-weight: 700;
    }

    .preflight {
      margin: 0;
      padding: 12px 18px;
      border-bottom: 1px solid var(--ledger-line);
      font-weight: 800;
    }

    .preflight.clean { background: var(--ledger-green-soft); color: var(--ledger-green); }
    .preflight.blocked { background: var(--ledger-red-soft); color: var(--ledger-red); }

    .holdings-table-wrap {
      overflow: auto;
      max-height: 420px;
    }

    .holdings-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 920px;
      font-size: 13px;
    }

    .holdings-table th {
      position: sticky;
      top: 0;
      background: #efe4cd;
      color: #53462f;
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      z-index: 1;
    }

    .holdings-table td {
      padding: 11px 12px;
      border-top: 1px solid #eadcc5;
      vertical-align: top;
    }

    .row-eligible { background: rgba(231, 242, 235, 0.64); }
    .row-blocked { background: rgba(248, 233, 228, 0.72); }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 9px;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .badge.ok { background: var(--ledger-green-soft); color: var(--ledger-green); }
    .badge.bad { background: var(--ledger-red-soft); color: var(--ledger-red); }
    .badge.info { background: var(--ledger-blue-soft); color: var(--ledger-blue); }

    .account-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px 18px;
      border-top: 1px solid var(--ledger-line);
      background: #fffaf0;
    }

    .transfer-panel {
      margin: 0 18px 18px;
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: #fffdfa;
      padding: 16px;
    }

    .transfer-panel[hidden] { display: none; }

    .transfer-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 18px;
      align-items: stretch;
    }

    .progress-track {
      height: 10px;
      border-radius: 999px;
      background: #eadcc5;
      overflow: hidden;
      margin: 12px 0;
    }

    .progress-fill {
      display: block;
      height: 100%;
      width: 0;
      background: linear-gradient(90deg, var(--ledger-green), var(--ledger-blue));
      transition: width 260ms ease;
    }

    .next-value {
      border: 1px solid #d6c195;
      border-radius: 8px;
      padding: 14px;
      background: #f8f0df;
    }

    .next-value span {
      display: block;
      color: var(--ledger-muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .next-value strong {
      display: block;
      margin-top: 6px;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 30px;
      word-break: break-word;
    }

    .transfer-copy-state {
      color: var(--ledger-muted);
      min-height: 22px;
      margin: 10px 0 0;
    }

    .packet-preview {
      margin-top: 14px;
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      overflow: hidden;
    }

    .output-panel {
      white-space: pre-wrap;
      border: 1px solid var(--ledger-line);
      background: #fffdfa;
      padding: 14px;
      border-radius: 8px;
      max-height: 300px;
      overflow: auto;
      margin: 0;
      color: #453b2a;
      line-height: 1.45;
    }

    @media (max-width: 960px) {
      .ledger-hero,
      .ledger-load-panel,
      .review-heading,
      .account-header,
      .transfer-grid {
        grid-template-columns: 1fr;
      }

      .ledger-checks,
      .metric-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}
