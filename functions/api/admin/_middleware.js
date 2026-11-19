// Owner authentication: password (env ADMIN_PASSWORD) -> signed, expiring, HttpOnly cookie.
const enc = new TextEncoder();
async function key(env) { return crypto.subtle.importKey('raw', enc.encode('danis-admin:' + env.ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export async function sign(env, exp) { return exp + '.' + hex(await crypto.subtle.sign('HMAC', await key(env), enc.encode(String(exp)))); }
async function valid(env, cookie) {
  const m = /(?:^|;\s*)danis_admin=(\d+)\.([0-9a-f]+)/.exec(cookie || '');
  if (!m || Number(m[1]) < Date.now()) return false;
  const sig = Uint8Array.from(m[2].match(/../g) || [], (h) => parseInt(h, 16));
  return crypto.subtle.verify('HMAC', await key(env), sig, enc.encode(m[1]));
}
const deny = (s, e) => new Response(JSON.stringify({ error: e }), { status: s, headers: { 'content-type': 'application/json' } });
export async function onRequest({ request, env, next }) {
  if (!env.ADMIN_PASSWORD) return deny(503, 'admin_not_configured');
  if (new URL(request.url).pathname === '/api/admin/login') return next();
  if (!(await valid(env, request.headers.get('cookie')))) return deny(401, 'unauthorized');
  return next();
}
