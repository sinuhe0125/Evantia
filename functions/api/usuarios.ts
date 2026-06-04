/**
 * Cloudflare Pages Function — /api/usuarios
 * Usa KV como base de datos compartida entre todos los navegadores.
 * 
 * KV binding: DEVSTREAM_KV (configurar en Cloudflare Pages → Settings → Functions → KV namespace bindings)
 */

const KV_KEY = 'usuarios';

const USUARIOS_DEFAULT = JSON.stringify([
  { id:1, nombre:'María González', cargo:'Project Manager',       email:'admin@devstream.cl',   password:'Admin2024!', rol:'Administrador' },
  { id:2, nombre:'Roberto Díaz',   cargo:'Project Manager',       email:'roberto@devstream.cl', password:'Roberto123', rol:'Supervisor'    },
  { id:3, nombre:'Carlos Rojas',   cargo:'Desarrollador Backend', email:'carlos@devstream.cl',  password:'Carlos123',  rol:'Operador'      },
]);

interface Env {
  DEVSTREAM_KV: KVNamespace;
}

function cors(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  // CORS preflight
  if (ctx.request.method === 'OPTIONS') return cors('', 204);

  const kv = ctx.env.DEVSTREAM_KV;

  // GET — leer usuarios
  if (ctx.request.method === 'GET') {
    const data = await kv.get(KV_KEY) ?? USUARIOS_DEFAULT;
    return cors(data);
  }

  // PUT — guardar usuarios
  if (ctx.request.method === 'PUT') {
    const body = await ctx.request.text();
    // Validar que sea JSON válido con array
    try {
      const arr = JSON.parse(body);
      if (!Array.isArray(arr)) return cors(JSON.stringify({ error: 'Expected array' }), 400);
    } catch {
      return cors(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }
    await kv.put(KV_KEY, body);
    return cors(JSON.stringify({ ok: true }));
  }

  return cors(JSON.stringify({ error: 'Method not allowed' }), 405);
};
