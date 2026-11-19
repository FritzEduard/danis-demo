# Danis: production plan

Owner had no preference on the four choices, so the recommended options were adopted (2026-11-17). Change any of them by telling the session.

1. **Hosting and storage**: Cloudflare Pages (static site) + a Pages Function / Worker + D1 (SQLite) for orders. Free tier, CDN close to West Africa, no server to maintain. The prototype stays plain HTML/JS.
2. **Notifications**: email to the owner via Resend (free tier) with Confirm / Refuse links, plus a pre-filled WhatsApp click-to-chat link. No WhatsApp Business API (needs Meta verification and per-message fees); can be added later.
3. **Payment**: PayDunya in sandbox first (one integration for Wave, Orange Money, Free Money and cards). Cash on pickup/delivery stays. Flow: order saved as `pending` -> owner confirms -> payment link sent / shown -> webhook marks it `paid`.
4. **Game**: keep the plain 2D canvas (lightest on phones); extend levels, sprites and sound there. Revisit Phaser only if the game grows a lot.

## Build order
1. Order API (`POST /api/orders`, D1 schema, validation, server-side price check) replacing the `STUB` in `app.js`.
2. Owner notification (email + WhatsApp link) and Confirm/Refuse endpoints.
3. PayDunya sandbox payment link and webhook.
4. Real content (catalog, photos, cook, hours, delivery) and game look.
5. Phone-size testing of both faces, README with run and deploy steps.

## Blocking content questions for the owner
- Pastry list: names, prices (FCFA), photos, descriptions (FR/EN).
- Cook: name, story, training, experience, certifications, photo.
- Address, phone/WhatsApp number, owner email, opening hours.
- Delivery zones and fee (prototype: 1 000 FCFA flat); does an order need a date?
- Game look: colours and character (proposal to come before building).
- Real shop name (is "Danis" final?).
