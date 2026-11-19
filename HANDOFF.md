# Handoff: Danis

A prototype was built from another session. This project's own session now takes over.

Read `BRIEF.md` (requirements), `README.md` (what is a stand-in) and the prototype files (`index.html`, `styles.css`, `app.js`, `game.js`). Run the prototype in a browser first and play the game.

Then take it toward production without throwing away what works:
1. Propose, and ask the owner to confirm, a short plan covering:
   - hosting;
   - where orders are stored and how the shop is notified (email and WhatsApp);
   - which Senegal payment provider to use (Wave, Orange Money, or card via PayDunya, CinetPay or PayTech);
   - the game approach going forward (the prototype uses a plain 2D canvas).
2. Ask the owner for the real content: pastry list with photos and prices, cook credentials, address, opening hours, delivery zones and fee, and the game's look (colours, character).
3. Implement the plan step by step. Keep the two faces sharing one cart and checkout, French by default with English available, and mobile-first speed. The `STUB` spot in `app.js` is where the server plugs in.
4. Keep the art original: nothing copied from Nintendo's Mario.
5. Do not run `git init` or deploy without asking. Ask before design or scope choices that are not in the brief.

Done means: orders are stored on a server, the shop is notified, the chosen payment flow works in test mode, both faces work on a phone, and the README explains how to run and deploy it.
