// Notify the shop of a new order. Email via Resend when RESEND_API_KEY is set; always builds a WhatsApp link.
// Env vars (Pages > Settings > Variables): RESEND_API_KEY, OWNER_EMAIL, FROM_EMAIL, OWNER_WHATSAPP (digits, e.g. 221770000000).
export function orderText(o, names) {
  const lines = Object.entries(o.items).map(([id, q]) => ` - ${q} x ${names[id]}`);
  return `Nouvelle commande ${o.id}\n${lines.join('\n')}\nTotal: ${o.total} FCFA\n` +
    `${o.mode === 'delivery' ? 'Livraison: ' + o.addr : 'Retrait en boutique'}${o.due ? '\nPour: ' + o.due : ''}\n` +
    `Client: ${o.name} ${o.phone}\nPaiement: ${o.pay}${o.note ? '\nMessage: ' + o.note : ''}`;
}

export async function notifyShop(env, o, origin, names) {
  const text = orderText(o, names);
  const confirm = `${origin}/api/decide?id=${o.id}&t=${o.token}&a=confirm`;
  const refuse = `${origin}/api/decide?id=${o.id}&t=${o.token}&a=refuse`;
  const wa = env.OWNER_WHATSAPP ? `https://wa.me/${env.OWNER_WHATSAPP}?text=${encodeURIComponent(text)}` : '';
  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL) { console.log(text, confirm, refuse, wa); return false; }
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'Danis <onboarding@resend.dev>', to: [env.OWNER_EMAIL], subject: 'Commande ' + o.id + ' - ' + o.total + ' FCFA',
      html: `<pre>${esc(text)}</pre><p><a href="${confirm}">Confirmer</a> | <a href="${refuse}">Refuser</a></p>${wa ? `<p><a href="${wa}">WhatsApp</a></p>` : ''}`
    })
  });
  return r.ok;
}
