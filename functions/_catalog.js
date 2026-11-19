// Prices and names live in the D1 `products` table (edited from /admin). The server never trusts browser prices.
export const PAY = ['wave', 'om', 'card', 'cash'];

export async function loadCatalog(env) {
  const { results } = await env.DB.prepare('SELECT id, fr, price FROM products WHERE active = 1').all();
  const prices = {}, names = {};
  for (const r of results) { prices[r.id] = r.price; names[r.id] = r.fr; }
  const f = await env.DB.prepare("SELECT value FROM settings WHERE key='delivery_fee'").first();
  return { prices, names, deliveryFee: f ? Number(f.value) || 0 : 0 };
}
