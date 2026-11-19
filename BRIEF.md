# Danis: project brief

A website for a pastry shop in Senegal. "Danis" is a working name for now.

## Requirements
One page if possible, with two faces the visitor can switch between.

### Face 1: the classic site
- Catalog of the pastries (photo, name, description, price in XOF/FCFA), contact info, opening hours and location.
- Ordering of pastries with payment methods suited to Senegal: propose and wire up options such as Wave, Orange Money and card payments through a Senegal-friendly provider (for example PayDunya, CinetPay or PayTech), plus cash on pickup or delivery. Explain the tradeoffs briefly before choosing.
- The shop owner is notified of every order (email, and propose WhatsApp as a second channel).

### Face 2: the mini-game
- A Super Mario style side-scrolling game used to order. The pastries are boxes; the player jumps to hit a box and the pastry is added to the order, with a clear counter and a way to review and confirm the order.
- It must feed the same order and payment flow as Face 1, so an order made in the game and one made in the catalog end up identical.
- Must work well on phones with touch controls (big jump and move buttons), and stay light. Keep a clear, always-visible way to switch back to the classic site.

### Cook section
- A section with the cook's credentials: story, training, experience, certifications and photo. Use clearly marked placeholders for text and photos the owner will supply later.

### Languages
French by default and as the priority, English available through a clear language switch.

## How to work
1. Read this folder, then write a short plan: tech stack proposal (hosting, where orders are stored, how notifications are sent, which payment provider, which game approach such as a 2D canvas library) and the few questions that block you. Ask the owner those questions before building anything big.
2. Build step by step. Run it locally and check it in a browser, including a phone-sized viewport. Make the classic site and the ordering flow work first, then the game.
3. Do not initialise git or deploy anything without asking.
4. Do not take design or scope liberties that are not in this brief without asking first. Game art style and colours in particular should be proposed to the owner before being built.
5. Keep costs low and prefer free tiers. Use original art and names: nothing copied from Nintendo's Mario.

## Done means
A working local site with both faces, French and English text, a working order flow shared by the catalog and the game that stores orders and notifies the owner (or a clear, tested stub for the notification and payment steps, with exact instructions to switch them on), the cook section, and a short README explaining how to run and deploy it.
