// Owner clicks Confirm / Refuse from the email. The per-order secret token authorises the change.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url), id = u.searchParams.get('id'), t = u.searchParams.get('t'), a = u.searchParams.get('a');
  const status = a === 'confirm' ? 'confirmed' : a === 'refuse' ? 'refused' : null;
  const html = (m, s) => new Response('<meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;padding:2rem"><h2>' + m + '</h2>', { status: s, headers: { 'content-type': 'text/html' } });
  if (!status || !id || !t) return html('Lien invalide', 400);
  const r = await env.DB.prepare("UPDATE orders SET status=? WHERE id=? AND token=? AND status='pending'").bind(status, id, t).run();
  return r.meta.changes ? html(status === 'confirmed' ? 'Commande ' + id + ' confirmée ✔' : 'Commande ' + id + ' refusée', 200) : html('Déjà traitée ou introuvable', 404);
}
