// Owner-editable site content: text overrides, contact numbers and the cook photo.
export async function loadSite(env) {
  const texts = { fr: {}, en: {} };
  const t = await env.DB.prepare('SELECT lang,key,value FROM texts').all();
  for (const r of t.results) if (texts[r.lang]) texts[r.lang][r.key] = r.value;
  const s = {};
  const st = await env.DB.prepare("SELECT key,value FROM settings WHERE key IN ('phone','whatsapp')").all();
  for (const r of st.results) s[r.key] = r.value;
  const cook = await env.DB.prepare("SELECT length(value) AS n FROM settings WHERE key='cook_photo'").first();
  return { texts, site: { phone: s.phone || '', whatsapp: s.whatsapp || '', cookPhoto: cook && cook.n ? '/api/photo?id=cook&v=' + cook.n : null } };
}
