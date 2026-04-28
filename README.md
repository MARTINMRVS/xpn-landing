# XPN Builder — Landing Page

Production landing for [padworks.cl](#) / Gumroad / wherever it ships. Single static HTML file — no build step, no framework.

## Files

- `index.html` — the page
- `assets/favicon/favicon.ico` — favicon (referenced by `<link rel="icon">`)
- `assets/mark.svg` — logo master (kept for future social cards / email; the page itself uses inline SVG)

## Source

Implemented from the Claude Design handoff bundle (`xpn-builder-01-brand`). Direction **01 Studio Instrument** — champagne on graphite, Unbounded display + IBM Plex Mono UI + Inter body. The user's final iteration choices from the design tool's Tweaks panel are baked in: accent `#D9BC82` (Highlight), tagline "The pro expansion builder for MPC.", headline scale 78%, lede scale 86%.

The design-tool-only Tweaks panel and `postMessage` edit-mode hooks were stripped — production users don't need them. Copy reconciled with shipping state (DMG ~99 MB instead of placeholder 42 MB; "Universal" claim removed since the current build is x64-only).

## Local preview

```bash
cd landing
python3 -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html`.

## Deploying

Static — drop into any host. Suggested:

- **GitHub Pages**: push to a `gh-pages` branch or enable Pages on the `landing/` folder of `main`
- **Vercel / Netlify**: point at this folder, framework "other"
- **Cloudflare Pages**: same

The page loads Google Fonts from CDN. If you need a fully offline single-file bundle (the original handoff included one as `XPN-Builder-Landing.html`), we can re-inline the fonts and SVG when shipping.

## Languages

EN / ES toggle in the topbar. Choice persisted to `localStorage` under `xpn_landing_lang`. Add new strings by setting `data-en="…"` and `data-es="…"` on any element — the script swaps innerHTML on click.

## Things still pointing at `#` (TODOs before launch)

- All `Get Solo / Studio / Label` CTAs — wire to Gumroad product URLs
- `Download for macOS ↓` — wire to the .dmg release URL
- Footer Changelog / Roadmap / Documentation / Video tutorials / Guide / Support / About / Contact — point at real pages
- X / Instagram — handles
