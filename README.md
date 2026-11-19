# Danis: prototype

Pastry shop site with two faces: a classic shop (catalog, cook credentials, contact, ordering) and a Mario-style
mini-game where you jump under pastry boxes to order. Both feed the same cart and checkout. French by default,
English through the EN/FR button. See `BRIEF.md` for the full requirements.

## Run it
Needs Node 18+. One-time setup, then start the local site and API:
```
npm install
npm run db:local      # creates the local orders table
npm run dev           # http://localhost:8788
```
Opening `index.html` directly (no server) still works: the checkout then falls back to saving orders in `localStorage`.

## Owner dashboard
Open `/admin/` (French, phone friendly). Log in with the password set in `ADMIN_PASSWORD` (`.dev.vars` locally, Pages settings in production; without it the dashboard is disabled). It lets the owner add and edit pastries (names FR/EN, descriptions, price, photo, emoji, colour, visible or hidden, position), set the delivery fee, and see and confirm/refuse orders. Changes appear at once in the shop and the game, and order totals always use these prices. Photos are resized in the browser to 800 px and stored in the database (no extra service). Pastries are hidden rather than deleted so old orders keep their names.

Optional local notification settings go in `.dev.vars` (never committed): `RESEND_API_KEY`, `OWNER_EMAIL`, `OWNER_WHATSAPP` (digits only, e.g. 221770000000). Without them the order text and the Confirm/Refuse/WhatsApp links are printed in the server log.

## Deploy (Cloudflare Pages, not done yet)
`npx wrangler d1 create danis`, put the id in `wrangler.toml`, `npm run db:remote`, set the same variables in Pages settings, then connect the repo. See `PLAN.md`.

## Files
- `functions/api/orders.js` (stores the order, recomputes prices server-side), `functions/api/products.js` + `photo.js` (public catalog), `functions/api/admin/*` (login, products, orders), `admin/index.html` (dashboard), `functions/api/decide.js` (owner Confirm/Refuse link), `functions/_notify.js` (email + WhatsApp link), `migrations/` (D1 schema), `assets/logo.png`.
- `index.html`, `styles.css`: page, both faces, and the cart drawer shared by both.
- `app.js`: catalog data (`PRODUCTS`), French/English texts (`TEXT`), cart, checkout, face switching.
- `game.js`: the game. All art is drawn in code (original chef and shapes, nothing copied). It only talks to the shop through `window.Danis`.

## What is a stand-in (to replace when migrating)
- **Orders** are now stored by the server in D1 (localStorage is only the offline fallback). Old note: they were kept in `localStorage` (`danis.orders`) and the "message to the shop" is only shown on screen: see the `STUB` comment in `app.js`. Real version: a server that saves the order, notifies the owner (email, and WhatsApp), and creates the Wave / Orange Money / card payment link once the shop confirms.
- **Catalog, prices, cook credentials, address and hours** are placeholders.
- **Photos**: emoji stand in for pastry photos.
- **Payments** are choices only; no provider is wired yet.

## Decisions to confirm
Game look (colours, character), delivery fee (1 000 FCFA flat), opening hours, whether the order needs a date, payment providers.
