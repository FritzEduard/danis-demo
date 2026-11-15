# Danis: prototype

Pastry shop site with two faces: a classic shop (catalog, cook credentials, contact, ordering) and a Mario-style
mini-game where you jump under pastry boxes to order. Both feed the same cart and checkout. French by default,
English through the EN/FR button. See `BRIEF.md` for the full requirements.

## Run it
Open `index.html` in a browser, or serve the folder: `python -m http.server 8082` then http://localhost:8082.
No build step and no dependencies. Works on a phone (the game has on-screen buttons).

## Files
- `index.html`, `styles.css`: page, both faces, and the cart drawer shared by both.
- `app.js`: catalog data (`PRODUCTS`), French/English texts (`TEXT`), cart, checkout, face switching.
- `game.js`: the game. All art is drawn in code (original chef and shapes, nothing copied). It only talks to the shop through `window.Danis`.

## What is a stand-in (to replace when migrating)
- **Orders** are kept in `localStorage` (`danis.orders`) and the "message to the shop" is only shown on screen: see the `STUB` comment in `app.js`. Real version: a server that saves the order, notifies the owner (email, and WhatsApp), and creates the Wave / Orange Money / card payment link once the shop confirms.
- **Catalog, prices, cook credentials, address and hours** are placeholders.
- **Photos**: emoji stand in for pastry photos.
- **Payments** are choices only; no provider is wired yet.

## Decisions to confirm
Game look (colours, character), delivery fee (1 000 FCFA flat), opening hours, whether the order needs a date, payment providers.
