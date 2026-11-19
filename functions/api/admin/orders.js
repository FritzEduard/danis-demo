const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT id,created,status,name,phone,mode,addr,due,note,pay,items,total FROM orders ORDER BY created DESC LIMIT 100').all();
  const names = {};
  (await env.DB.prepare('SELECT id,fr FROM products').all()).results.forEach((p) => { names[p.id] = p.fr; });
  return json({ names, orders: results.map((o) => ({ ...o, items: JSON.parse(o.items) })) });
}

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  if (!['pending', 'confirmed', 'refused', 'done', 'cancelled'].includes(b.status)) return json({ error: 'status' }, 400);
  const r = await env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(b.status, b.id).run();
  return r.meta.changes ? json({ ok: true }) : json({ error: 'not_found' }, 404);
}
