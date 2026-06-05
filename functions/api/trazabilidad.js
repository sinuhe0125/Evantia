const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function resp(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(ctx) {
  const kv = ctx.env.DEVSTREAM_KV;
  if (!kv) return resp('[]');
  const data = await kv.get('trazabilidad');
  return resp(data ?? '[]');
}

export async function onRequestPost(ctx) {
  const kv = ctx.env.DEVSTREAM_KV;
  const body = await ctx.request.text();
  try {
    const entrada = JSON.parse(body);
    // Leer registros actuales
    const raw = kv ? await kv.get('trazabilidad') : null;
    const registros = raw ? JSON.parse(raw) : [];
    // Agregar nuevo al inicio, máximo 500 registros
    registros.unshift({ ...entrada, id: Date.now() });
    if (registros.length > 500) registros.length = 500;
    if (kv) await kv.put('trazabilidad', JSON.stringify(registros));
    return resp({ ok: true });
  } catch {
    return resp({ error: 'Invalid JSON' }, 400);
  }
}
