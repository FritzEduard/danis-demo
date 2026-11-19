import { loadCatalog, PAY } from '../_catalog.js';
import { notifyShop } from '../_notify.js';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
const clean = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }

  const { prices: PRICES, names: NAMES, deliveryFee: DELIVERY_FEE } = await loadCatalog(env);
  const items = {};
  let subtotal = 0;
  for (const [id, q] of Object.entries(b.items || {})) {
    const qty = Math.floor(Number(q));
    if (!(id in PRICES) || !(qty >= 1 && qty <= 99)) return json({ error: 'bad_items' }, 400);
    items[id] = qty; subtotal += qty * PRICES[id];
  }
  if (!Object.keys(items).length) return json({ error: 'empty' }, 400);

  const name = clean(b.name, 80), phone = clean(b.phone, 30);
  const mode = b.mode === 'delivery' ? 'delivery' : 'pickup';
  const addr = clean(b.addr, 200);
  const pay = PAY.includes(b.pay) ? b.pay : null;
  if (!name) return json({ error: 'name' }, 400);
  if (phone.replace(/\D/g, '').length < 8) return json({ error: 'phone' }, 400);
  if (mode === 'delivery' && !addr) return json({ error: 'addr' }, 400);
  if (!pay) return json({ error: 'pay' }, 400);

  const delivery = mode === 'delivery' ? DELIVERY_FEE : 0;
  const order = {
    id: 'DN-' + crypto.randomUUID().slice(0, 6).toUpperCase(),
    token: crypto.randomUUID().replace(/-/g, ''),
    created: new Date().toISOString(), status: 'pending', name, phone, mode, addr,
    due: clean(b.when, 10), note: clean(b.note, 500), pay, items,
    subtotal, delivery, total: subtotal + delivery
  };

  await env.DB.prepare('INSERT INTO orders (id,token,created,status,name,phone,mode,addr,due,note,pay,items,subtotal,delivery,total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(order.id, order.token, order.created, order.status, name, phone, mode, addr, order.due, order.note, pay, JSON.stringify(items), subtotal, delivery, order.total).run();

  // Notification failure must not lose the order: it is already stored.
  let notified = false;
  try { notified = await notifyShop(env, order, new URL(request.url).origin, NAMES); } catch (e) { console.error('notify failed', e); }

  return json({ id: order.id, total: order.total, notified });
}
