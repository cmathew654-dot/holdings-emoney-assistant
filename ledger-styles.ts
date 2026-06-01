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

    .bookmark-installer {
      border: 2px solid #2c261c;
      border-radius: 8px;
      padding: 16px;
      background: linear-gradient(180deg, #fff4ce, #f7e8bd);
      box-shadow: inset 0 0 0 1px rgba(255, 250, 240, 0.7);
    }

    .bookmark-installer span {
      display: block;
      color: #6f5729;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .bookmark-installer strong {
      display: block;
      margin-top: 6px;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 31px;
      line-height: 1;
    }

    .bookmark-installer p {
      color: #4e432e;
      line-height: 1.45;
    }

    .bookmarklet-link {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 74px;
      margin-top: 14px;
      border: 2px dashed #fffaf0;
      border-radius: 6px;
      background: #2c261c;
      color: #fffaf0;
      padding: 14px;
      font-weight: 900;
      line-height: 1.2;
      text-align: center;
      text-decoration: none;
      cursor: grab;
      user-select: none;
      box-shadow: 0 12px 26px rgba(44, 38, 28, 0.22);
    }

    .bookmarklet-link:active {
      cursor: grabbing;
    }

    .bookmark-actions {
      margin-top: 10px;
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

    .output-details {
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 250, 240, 0.74);
      padding: 0;
    }

    .output-details[hidden] { display: none; }

    .output-details summary {
      cursor: pointer;
      padding: 12px 14px;
      color: #51452e;
      font-weight: 900;
    }

    .output-panel {
      white-space: pre-wrap;
      border: 0;
      border-top: 1px solid var(--ledger-line);
      background: #fffdfa;
      padding: 14px;
      border-radius: 0 0 8px 8px;
      max-height: 300px;
      overflow: auto;
      margin: 0;
      color: #453b2a;
      line-height: 1.45;
    }

    .ledger-app-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 24px;
      align-items: start;
      padding: 18px 20px 16px;
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 253, 248, 0.92);
      box-shadow: var(--ledger-shadow);
    }

    .ledger-brand {
      display: flex;
      gap: 16px;
      align-items: center;
      min-width: 0;
    }

    .ledger-mark {
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      flex: 0 0 auto;
      border: 2px solid #a88446;
      background: linear-gradient(145deg, #113f31, #1f6a53);
      color: #fffaf0;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 34px;
      line-height: 1;
      box-shadow: inset 0 0 0 2px rgba(255, 250, 240, 0.42), 0 10px 24px rgba(17, 63, 49, 0.2);
    }

    .ledger-brand .ledger-title {
      font-size: clamp(28px, 3vw, 42px);
      line-height: 1.02;
      max-width: none;
    }

    .ledger-brand .ledger-subtitle {
      margin: 6px 0 0;
      max-width: none;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: var(--ledger-muted);
    }

    .ledger-header-right {
      display: grid;
      justify-items: end;
      gap: 10px;
      min-width: 360px;
    }

    .ledger-session {
      display: inline-flex;
      gap: 9px;
      align-items: center;
      margin: 0;
      color: var(--ledger-muted);
      font-weight: 800;
    }

    .ledger-session i {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #b8aa8f;
    }

    .ledger-session.is-active i {
      background: var(--ledger-green);
      box-shadow: 0 0 0 4px rgba(39, 107, 83, 0.12);
    }

    .ledger-safety-badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    .ledger-safety-badges span {
      border: 1px solid #d7c9b0;
      border-radius: 6px;
      background: #fffdf8;
      color: #3f4f43;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .workflow-stepper {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: center;
      gap: 12px;
      margin: 18px 0;
    }

    .workflow-step {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 42px;
      color: var(--ledger-muted);
      font-weight: 800;
    }

    .workflow-step::after {
      content: "";
      position: absolute;
      left: 48px;
      right: -12px;
      top: 20px;
      height: 2px;
      background: #cdbd9d;
      z-index: 0;
    }

    .workflow-step:last-child::after { display: none; }

    .workflow-step b {
      position: relative;
      z-index: 1;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      border: 1px solid #cdbd9d;
      background: #fffdf8;
      color: var(--ledger-muted);
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 16px;
    }

    .workflow-step.is-complete b {
      border-color: var(--ledger-green);
      background: var(--ledger-green);
      color: #fffaf0;
      font-size: 0;
    }

    .workflow-step.is-complete b::before {
      content: "\\2713";
      font-size: 17px;
      font-family: "Bahnschrift", "Segoe UI", sans-serif;
    }

    .workflow-step.is-active {
      color: var(--ledger-ink);
    }

    .workflow-step.is-active b {
      border-color: var(--ledger-green);
      background: var(--ledger-green);
      color: #fffaf0;
      animation: stepPulse 1550ms ease-in-out infinite;
    }

    @keyframes stepPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(39, 107, 83, 0.28); }
      50% { box-shadow: 0 0 0 10px rgba(39, 107, 83, 0); }
    }

    .ledger-skeleton {
      display: grid;
      gap: 12px;
      padding: 18px;
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 250, 240, 0.82);
    }

    .ledger-skeleton p {
      margin: 0;
      color: var(--ledger-muted);
      font-weight: 800;
    }

    .ledger-skeleton span {
      display: block;
      height: 18px;
      border-radius: 999px;
      background: linear-gradient(90deg, #eee2cc 0%, #fffaf0 48%, #eee2cc 100%);
      background-size: 220% 100%;
      animation: skeletonSweep 1200ms ease-in-out infinite;
    }

    .ledger-skeleton span:nth-child(3) { width: 84%; }
    .ledger-skeleton span:nth-child(4) { width: 62%; }

    @keyframes skeletonSweep {
      from { background-position: 100% 0; }
      to { background-position: -100% 0; }
    }

    .preflight-summary {
      position: sticky;
      top: 0;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0;
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 253, 248, 0.95);
      box-shadow: 0 12px 32px rgba(76, 56, 24, 0.08);
      overflow: hidden;
      backdrop-filter: blur(10px);
    }

    .preflight-summary-global {
      margin-bottom: 14px;
    }

    .preflight-metric {
      padding: 13px 18px;
      border-right: 1px solid #e5d8bf;
    }

    .preflight-metric:last-of-type { border-right: 0; }

    .preflight-metric span {
      display: block;
      margin-bottom: 5px;
      color: var(--ledger-muted);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .preflight-metric strong {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 24px;
      line-height: 1;
    }

    .preflight-metric.is-eligible strong { color: var(--ledger-green); }
    .preflight-metric.is-blocked strong,
    .preflight-metric.is-warning strong { color: #b47413; }

    .account-preflight {
      top: 8px;
      border-width: 0 0 1px;
      border-radius: 0;
      box-shadow: none;
    }

    .override-state {
      grid-column: 1 / -1;
      margin: 0;
      padding: 10px 18px;
      border-top: 1px solid #e5d8bf;
      color: var(--ledger-muted);
      font-weight: 800;
      background: #fffaf0;
    }

    .account-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 310px;
      gap: 20px;
      align-items: start;
      padding: 18px;
    }

    .account-main {
      min-width: 0;
    }

    .table-heading {
      margin: 0 0 10px;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 20px;
    }

    .holdings-table-wrap {
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 253, 248, 0.62);
    }

    .holdings-table th span {
      display: block;
      margin-top: 2px;
      color: #7a6d56;
      font-size: 9px;
      letter-spacing: 0;
      text-transform: lowercase;
    }

    .holdings-table tbody tr {
      animation: rowValidate 360ms ease both;
      transition: background 140ms ease, outline-color 140ms ease, box-shadow 140ms ease;
    }

    @keyframes rowValidate {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .holdings-table tbody tr:hover {
      background: #fffdf8;
    }

    .holdings-table tbody tr:focus-visible {
      outline: 2px solid #245f4b;
      outline-offset: -2px;
      box-shadow: inset 3px 0 0 #245f4b, 0 0 0 4px rgba(39, 107, 83, 0.12);
    }

    .row-blocked:hover .blocked-reason-cell::after {
      content: attr(data-detail);
      flex-basis: 100%;
      color: var(--ledger-muted);
      font-size: 11px;
      line-height: 1.25;
    }

    .status-pill,
    .reason-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 9px;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .status-pill.ok {
      background: var(--ledger-green-soft);
      color: var(--ledger-green);
    }

    .status-pill.bad,
    .reason-chip {
      background: #fff0cf;
      color: #91610f;
      border: 1px solid #efd39b;
    }

    .blocked-reason-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .issues-cell {
      color: #4e4638;
    }

    .issue-info {
      display: inline-grid;
      place-items: center;
      width: 16px;
      height: 16px;
      margin-left: 6px;
      border-radius: 999px;
      border: 1px solid #cdbd9d;
      color: #6f5b35;
      font-size: 10px;
      font-weight: 900;
      cursor: help;
    }

    .transfer-rail {
      display: grid;
      gap: 12px;
      align-content: start;
    }

    .rail-card {
      border: 1px solid var(--ledger-line);
      border-radius: 8px;
      background: rgba(255, 253, 248, 0.92);
      padding: 14px;
      box-shadow: 0 14px 34px rgba(76, 56, 24, 0.08);
    }

    .rail-card h3,
    .rail-card strong {
      margin: 0;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 20px;
      line-height: 1.1;
    }

    .rail-card p {
      color: var(--ledger-muted);
      line-height: 1.42;
      margin: 10px 0;
    }

    .field-list-grid {
      display: grid;
      gap: 10px;
      margin: 12px 0;
    }

    .field-list {
      border-left: 3px solid var(--ledger-green);
      padding-left: 10px;
    }

    .field-list.excluded {
      border-left-color: #c77a15;
    }

    .field-list strong {
      font-family: "Bahnschrift", "Segoe UI", sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .field-list ul {
      margin: 6px 0 0;
      padding-left: 18px;
      color: var(--ledger-ink);
      line-height: 1.35;
      font-size: 13px;
    }

    .manual-boundary {
      font-weight: 900;
      color: var(--ledger-ink) !important;
    }

    .ledger-button.full-width {
      width: 100%;
      justify-content: center;
    }

    .transfer-copy-state {
      min-height: 20px;
      font-size: 13px;
    }

    .transfer-copy-state.copied {
      color: var(--ledger-green);
      font-weight: 800;
    }

    .bookmark-installer {
      border: 1px solid #d0b77f;
      background: #fff6df;
    }

    .bookmarklet-link {
      min-height: 46px;
      justify-content: flex-start;
      gap: 10px;
      border: 1px solid #d9c7a1;
      border-radius: 6px;
      background: #fffdf8;
      color: var(--ledger-ink);
      box-shadow: none;
      transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
    }

    .bookmarklet-link::before {
      content: "::::";
      color: #a68b56;
      letter-spacing: -3px;
      font-weight: 900;
    }

    .bookmarklet-link::after {
      content: "[]";
      color: #5c4b2d;
      font-size: 13px;
    }

    .bookmarklet-link:hover {
      transform: translateY(-2px);
      border-color: #a88446;
      box-shadow: 0 10px 22px rgba(76, 56, 24, 0.12);
    }

    .bookmarklet-link:active,
    .ledger-button:active {
      transform: translateY(1px);
      box-shadow: inset 0 2px 8px rgba(44, 38, 28, 0.18);
    }

    .operator-guidance {
      background: #fff8e8;
    }

    .operator-guidance strong {
      font-family: "Bahnschrift", "Segoe UI", sans-serif;
      font-size: 13px;
    }

    .fallback-details {
      border-top: 1px dashed var(--ledger-line);
      padding-top: 10px;
      color: var(--ledger-muted);
    }

    .fallback-details summary {
      cursor: pointer;
      font-weight: 900;
      font-size: 13px;
    }

    .ledger-footer {
      display: grid;
      justify-items: center;
      gap: 5px;
      margin-top: 26px;
      color: #745d32;
      text-align: center;
    }

    .ledger-footer strong {
      font-size: 12px;
      letter-spacing: 0.22em;
      word-spacing: 0.35em;
    }

    .ledger-footer span {
      font-size: 10px;
      letter-spacing: 0.3em;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (max-width: 960px) {
      .ledger-app-header,
      .ledger-hero,
      .ledger-load-panel,
      .review-heading,
      .account-header,
      .account-body,
      .transfer-grid {
        grid-template-columns: 1fr;
      }

      .ledger-header-right {
        justify-items: start;
        min-width: 0;
      }

      .ledger-safety-badges {
        justify-content: flex-start;
      }

      .workflow-stepper {
        grid-template-columns: 1fr;
      }

      .workflow-step::after {
        left: 18px;
        right: auto;
        top: 38px;
        bottom: -16px;
        width: 2px;
        height: auto;
      }

      .ledger-checks,
      .metric-strip,
      .preflight-summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .ledger-shell {
        width: min(100vw - 20px, 1440px);
        padding: 14px 0 28px;
      }

      .ledger-brand {
        align-items: flex-start;
      }

      .ledger-mark {
        width: 48px;
        height: 48px;
        font-size: 28px;
      }

      .ledger-brand .ledger-title {
        font-size: 25px;
      }

      .preflight-summary,
      .ledger-checks,
      .metric-strip {
        grid-template-columns: 1fr;
      }

      .preflight-metric {
        border-right: 0;
        border-bottom: 1px solid #e5d8bf;
      }

      .preflight-metric:last-of-type { border-bottom: 0; }
    }
  `;
  document.head.appendChild(style);
}
