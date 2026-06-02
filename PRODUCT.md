# Product

## Register

product

## Users

Wealth-management operators at a $5B AUM RIA. Dual-monitor workstation in a daylit office. They've exported a custodial holdings CSV (Raymond James shape) and need to push approved rows into the client's eMoney Holdings page without typing each value, without writing market value, asset class, sector, description, or clicking Save. They are alternating focus between this app and the live eMoney session in the same browser, often dozens of times per session.

## Product Purpose

CSV → conservative eligibility gate → reviewed Fill Packet → bookmarklet on the eMoney Holdings page fills ticker, units, cost basis only. Operator manually saves in eMoney. Every safety boundary is durable and visible in chrome: local-only, no backend, no client-data API, no auto-save, human-in-the-loop required, blocked rows excluded by default, ambiguous matches hard-stop, packet has 8-hour expiry, schema version validated, duplicate-ticker pre-check before any row is filled.

## Brand Personality

Instrument of compliance. Auditable, deliberate, honest about what it writes and what it refuses to touch. Closer to a regulatory form than a consumer product. Three words: **Auditable. Calm. Precise.**

## Anti-references

- SaaS startup landing page aesthetic (decorative serif headings, gradient body backgrounds, soft drop-shadows on everything, animated metric pulses, gilded accents).
- "Magazine-warm" / "cream-parchment-vintage-ledger" cosplay — the saturated AI default for finance projects in 2026. The current branch is exactly this.
- Bloomberg Terminal dark-mode cosplay — would clash visually with the live eMoney session the operator alt-tabs into constantly.
- "Linear / Notion / Stripe for finance" — too consumer.

## Design Principles

1. **Show every write boundary, always.** The allowed-fields list (ticker, units, costBasis) and the excluded-fields list (marketValue, assetClass, sector, description, Save) are not aside content — they live in chrome on every screen.
2. **Dense without crowded.** Operators want glance-able state, not editorial whitespace. Hairline rules carry layout, not framing shadows.
3. **One typographic voice.** Workstation sans for chrome and labels; monospace tabular figures for any number that will end up on the wire. No display-font headings.
4. **Motion conveys state, never decoration.** No pulses on idle UI, no orchestrated page-load reveals. Loading and state transitions get motion; passive surfaces do not.
5. **Visually continuous with eMoney.** Light background, restrained accent palette. The operator switches contexts constantly; visual whiplash is friction.

## Accessibility & Inclusion

WCAG AA contrast on body text and labels (≥4.5:1; large text ≥3:1). `prefers-reduced-motion` honored. Color is never the only signal: blocked/eligible status carries text and icon in addition to tint. Tab order matches reading order through Load → Review → Packet → Fill. Focus rings visible against every surface variant.
