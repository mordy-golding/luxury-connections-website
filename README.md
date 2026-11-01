# Luxury Connections — holding page

One-page static site. No build step, no framework, no forms, no tracking, no cookies.

Preview locally: open `index.html` in a browser, or run `python3 -m http.server` in this folder and open http://localhost:8000.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `styles.css` | All styles, self-hosted fonts and animation |
| `assets/logo-*.svg` | Knot, wordmark and tagline, split from the client logo |
| `assets/img/` | Hero and door photos (AVIF/WebP at 640–1672px, JPEG fallback), `og.jpg` share image |
| `assets/fonts/` | Bellefair, Inter, Source Serif 4 italic (latin subset, woff2) |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Icons |
| `robots.txt`, `vercel.json` | Indexing and Vercel config (static, no build) |
| `source/` | Original client files — not deployed |
| `tools/` | Scripts that generate everything in `assets/` from `source/` — not deployed |

## Swapping in new photos or logo

1. Replace the file in `source/` (keep the same name: `hero.png`, `door.png`, `LC_ICON.png`, `LC_LOGO_Color with Tagline.svg`).
2. Regenerate:
   ```sh
   cd tools && npm install
   npm run logo     # only if the logo changed
   npm run images   # photos, favicons, og.jpg
   ```
3. If the new photos are wider than 1672px, add the larger width to `widths` in `tools/build-images.mjs` and to the `srcset` lists in `index.html`.
4. Commit and push; Vercel redeploys automatically.

## Deploy

GitHub: https://github.com/mordy-golding/luxury-connections-website — every push to `main` deploys to production on Vercel.

1. After client approval: Vercel → Project → Settings → Domains → add `luxuryconnections.com` and `www.luxuryconnections.com`. Vercel shows the exact DNS records.
2. GoDaddy → DNS for the domain → change **only** the records Vercel asks for (typically the `@` A record and the `www` CNAME).

**Do not touch the MX, TXT (SPF/DKIM/DMARC) or autodiscover records** — those run Avi's email (avi@luxuryconnections.com). Screenshot the full GoDaddy DNS table before changing anything so it can be restored. Also check whether GoDaddy has domain "forwarding" turned on; if so, turn it off or it will override the records.
