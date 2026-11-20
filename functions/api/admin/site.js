import { loadSite } from '../../_site.js';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function onRequestGet({ env }) { return json(await loadSite(env)); }

// Body: { texts: {fr:{key:value}, en:{...}}, phone, whatsapp, cookPhoto }. Every part is optional.
// `texts` replaces all overrides: an empty or missing entry goes back to the built-in default.
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const stmts = [];
  const set = (k, v) => env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, v);
  if (b.texts) {
    stmts.push(env.DB.prepare('DELETE FROM texts'));
    for (const lang of ['fr', 'en']) {
      for (const [k, v] of Object.entries((b.texts || {})[lang] || {})) {
        const val = String(v == null ? '' : v).trim();
        if (!/^[a-z0-9_]{1,40}$/.test(k) || val.length > 600) return json({ error: 'text' }, 400);
        if (val) stmts.push(env.DB.prepare('INSERT INTO texts(lang,key,value) VALUES(?,?,?)').bind(lang, k, val));
      }
    }
  }
  if (b.phone !== undefined) { const v = String(b.phone).trim().slice(0, 30); if (v && v.replace(/\D/g, '').length < 8) return json({ error: 'phone' }, 400); stmts.push(set('phone', v)); }
  if (b.whatsapp !== undefined) { const v = String(b.whatsapp).replace(/\D/g, '').slice(0, 20); if (v && v.length < 8) return json({ error: 'whatsapp' }, 400); stmts.push(set('whatsapp', v)); }
  if (b.cookPhoto !== undefined) {
    if (b.cookPhoto === null) stmts.push(set('cook_photo', ''));
    else if (typeof b.cookPhoto === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.cookPhoto) && b.cookPhoto.length <= 900000) stmts.push(set('cook_photo', b.cookPhoto));
    else return json({ error: 'photo' }, 400);
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
