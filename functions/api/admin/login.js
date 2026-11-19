import { sign } from './_middleware.js';
const H = { 'content-type': 'application/json' };

export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch (e) { /* ignore */ }
  await new Promise((r) => setTimeout(r, 400)); // slows down password guessing
  const a = new TextEncoder().encode(String(b.password || '')), c = new TextEncoder().encode(env.ADMIN_PASSWORD);
  let diff = a.length ^ c.length; for (let i = 0; i < c.length; i++) diff |= (a[i] || 0) ^ c[i];
  if (diff) return new Response('{"error":"bad_password"}', { status: 401, headers: H });
  const exp = Date.now() + 7 * 864e5, secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return new Response('{"ok":true}', { headers: { ...H, 'set-cookie': `danis_admin=${await sign(env, exp)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 86400}${secure}` } });
}

export async function onRequestDelete() {
  return new Response('{"ok":true}', { headers: { ...H, 'set-cookie': 'danis_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' } });
}
