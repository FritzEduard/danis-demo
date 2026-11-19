// Serves a product photo stored as a data URL in D1.
export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  const r = await env.DB.prepare('SELECT photo FROM products WHERE id=?').bind(id).first();
  const m = r && r.photo && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(r.photo);
  if (!m) return new Response('Not found', { status: 404 });
  const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { 'content-type': m[1], 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
}
