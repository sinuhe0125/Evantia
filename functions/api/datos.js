/**
 * /api/datos — almacena proyectos, trabajadores, cargos y roles en KV
 * GET  /api/datos?key=proyectos   → devuelve el valor
 * PUT  /api/datos?key=proyectos   → guarda el valor
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const KEYS_PERMITIDAS = ['proyectos', 'trabajadores', 'cargos', 'roles'];

function resp(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(ctx) {
  const url = new URL(ctx.request.url);
  const key = url.searchParams.get('key');
  if (!key || !KEYS_PERMITIDAS.includes(key)) return resp({ error: 'Invalid key' }, 400);
  const kv = ctx.env.DEVSTREAM_KV;
  if (!kv) return resp('null');
  const data = await kv.get(key);
  return resp(data ?? 'null');
}

export async function onRequestPut(ctx) {
  const url = new URL(ctx.request.url);
  const key = url.searchParams.get('key');
  if (!key || !KEYS_PERMITIDAS.includes(key)) return resp({ error: 'Invalid key' }, 400);
  const kv = ctx.env.DEVSTREAM_KV;
  const body = await ctx.request.text();
  try {
    JSON.parse(body); // validar JSON
    if (kv) await kv.put(key, body);
    return resp({ ok: true });
  } catch {
    return resp({ error: 'Invalid JSON' }, 400);
  }
}
