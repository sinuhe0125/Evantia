const KV_KEY = 'usuarios';

const USUARIOS_DEFAULT = JSON.stringify([
  { id:1, nombre:'María González', cargo:'Project Manager',       email:'admin@devstream.cl',   password:'Admin2024!', rol:'Administrador' },
  { id:2, nombre:'Roberto Díaz',   cargo:'Project Manager',       email:'roberto@devstream.cl', password:'Roberto123', rol:'Supervisor'    },
  { id:3, nombre:'Carlos Rojas',   cargo:'Desarrollador Backend', email:'carlos@devstream.cl',  password:'Carlos123',  rol:'Operador'      },
]);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
  if (!kv) return resp(USUARIOS_DEFAULT);
  const data = await kv.get(KV_KEY);
  return resp(data ?? USUARIOS_DEFAULT);
}

export async function onRequestPut(ctx) {
  const kv = ctx.env.DEVSTREAM_KV;
  const body = await ctx.request.text();
  try {
    const arr = JSON.parse(body);
    if (!Array.isArray(arr)) return resp({ error: 'Expected array' }, 400);
    if (kv) await kv.put(KV_KEY, body);
    return resp({ ok: true });
  } catch {
    return resp({ error: 'Invalid JSON' }, 400);
  }
}
