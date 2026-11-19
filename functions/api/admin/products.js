const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT id,fr,en,dfr,den,price,emoji,color,active,sort,updated,(photo IS NOT NULL) AS has_photo FROM products ORDER BY sort,rowid').all();
  const f = await env.DB.prepare("SELECT value FROM settings WHERE key='delivery_fee'").first();
  return json({ products: results, deliveryFee: f ? Number(f.value) : 0 });
}

// Create or update. `photo`: a data URL to set, null to remove, undefined to keep. `deliveryFee` alone updates the setting.
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  if (b.deliveryFee !== undefined) {
    const fee = Math.floor(Number(b.deliveryFee));
    if (!(fee >= 0 && fee <= 1e6)) return json({ error: 'fee' }, 400);
    await env.DB.prepare("INSERT INTO settings(key,value) VALUES('delivery_fee',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(fee)).run();
    return json({ ok: true });
  }
  const price = Math.floor(Number(b.price)), fr = str(b.fr, 80), en = str(b.en, 80) || fr;
  if (!fr) return json({ error: 'name' }, 400);
  if (!(price >= 0 && price <= 1e7)) return json({ error: 'price' }, 400);
  const color = /^#[0-9a-fA-F]{6}$/.test(b.color) ? b.color : '#ece4f6';
  const emoji = str(b.emoji, 8) || '🧁', dfr = str(b.dfr, 300), den = str(b.den, 300), active = b.active ? 1 : 0, sort = Math.floor(Number(b.sort)) || 0;
  const photo = b.photo;
  if (typeof photo === 'string' && (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > 900000)) return json({ error: 'photo' }, 400);
  const now = Date.now();
  const existing = b.id ? await env.DB.prepare('SELECT id FROM products WHERE id=?').bind(b.id).first() : null;
  if (existing) {
    await env.DB.prepare('UPDATE products SET fr=?,en=?,dfr=?,den=?,price=?,emoji=?,color=?,active=?,sort=?,updated=? WHERE id=?').bind(fr, en, dfr, den, price, emoji, color, active, sort, now, b.id).run();
    if (photo !== undefined) await env.DB.prepare('UPDATE products SET photo=? WHERE id=?').bind(photo, b.id).run();
    return json({ ok: true, id: b.id });
  }
  const id = 'p' + crypto.randomUUID().slice(0, 8);
  await env.DB.prepare('INSERT INTO products(id,fr,en,dfr,den,price,emoji,color,active,sort,photo,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, fr, en, dfr, den, price, emoji, color, active, sort, photo || null, now).run();
  return json({ ok: true, id });
}
