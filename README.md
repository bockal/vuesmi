# The Vues at Klinger Lake

Owner-controlled request-to-book website for [vuesmi.com](https://vuesmi.com).

## What it includes

- Public property listing, gallery, amenities, Matterport tour, and Google reviews
- Dynamic seasonal and per-guest quote calculation
- Request-to-book workflow with a two-night minimum
- Availability calendar and owner-managed date blocks
- Private owner area restricted to the approved owner emails
- Cloudflare D1 persistence and optional email delivery

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Create a local `.env` file for runtime values. Environment files, dependencies,
build output, and local Cloudflare state are excluded from Git.

## Production build

```bash
npm run build
```

The application uses Vinext and is designed for the Cloudflare Workers runtime.
Cloudflare hosts the running application; this GitHub repository remains the
source of truth.

## Deployment notes

The production environment needs a D1 database binding named `DB`. Optional
email delivery uses `RESEND_API_KEY` and `MAIL_FROM`. Legacy Stripe routes remain
disabled unless Stripe environment values are deliberately configured.
