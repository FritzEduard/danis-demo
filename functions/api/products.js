// Public catalog used by the shop and the game.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT id,fr,en,dfr,den,price,emoji,color,updated,(photo IS NOT NULL) AS has_photo FROM products WHERE active=1 ORDER BY sort,rowid').all();
  const f = await env.DB.prepare("SELECT value FROM settings WHERE key='delivery_fee'").first();
  const products = results.map((r) => ({ id: r.id, fr: r.fr, en: r.en, dfr: r.dfr, den: r.den, price: r.price, emoji: r.emoji, color: r.color,
    photo: r.has_photo ? `/api/photo?id=${encodeURIComponent(r.id)}&v=${r.updated}` : null }));
  return new Response(JSON.stringify({ products, deliveryFee: f ? Number(f.value) || 0 : 0 }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
