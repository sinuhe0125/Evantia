/**
 * Base de datos compartida via Cloudflare KV (Pages Functions).
 * Todos los datos se leen/escriben en KV → compartidos entre navegadores.
 */

export interface UsuarioDB {
  id: number; nombre: string; cargo: string;
  email: string; password: string; rol: string;
}

export const USUARIOS_DEFAULT: UsuarioDB[] = [
  { id:1, nombre:'María González', cargo:'Project Manager',       email:'admin@devstream.cl',   password:'Admin2024!', rol:'Administrador' },
  { id:2, nombre:'Roberto Díaz',   cargo:'Project Manager',       email:'roberto@devstream.cl', password:'Roberto123', rol:'Supervisor'    },
  { id:3, nombre:'Carlos Rojas',   cargo:'Desarrollador Backend', email:'carlos@devstream.cl',  password:'Carlos123',  rol:'Operador'      },
];

export interface Traza {
  id: number;
  fecha: string;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  descripcion: string;
}

// ── Cache local (fallback cuando KV no responde) ──────────────────────────────

function fromCache<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(`kv_${key}`); return r ? JSON.parse(r) as T : fallback; }
  catch { return fallback; }
}
function toCache(key: string, data: unknown) {
  try { localStorage.setItem(`kv_${key}`, JSON.stringify(data)); } catch { /* noop */ }
}

// ── Helpers de fetch ──────────────────────────────────────────────────────────

async function kfetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, { ...options, cache: 'no-store' });
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export function dbConfigured(): boolean { return true; }

export async function dbGetUsuarios(): Promise<UsuarioDB[]> {
  try {
    const r = await kfetch('/api/usuarios');
    if (!r.ok) return fromCache('usuarios', USUARIOS_DEFAULT);
    const text = await r.text();
    const arr = JSON.parse(text) as UsuarioDB[];
    if (Array.isArray(arr) && arr.length > 0) { toCache('usuarios', arr); return arr; }
    return fromCache('usuarios', USUARIOS_DEFAULT);
  } catch { return fromCache('usuarios', USUARIOS_DEFAULT); }
}

export async function dbSetUsuarios(usuarios: UsuarioDB[]): Promise<boolean> {
  toCache('usuarios', usuarios);
  try {
    const r = await kfetch('/api/usuarios', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(usuarios) });
    return r.ok;
  } catch { return false; }
}

// ── Datos genéricos ───────────────────────────────────────────────────────────

export type DataKey = 'proyectos' | 'trabajadores' | 'cargos' | 'roles';

export async function kvGet<T>(key: DataKey, fallback: T): Promise<T> {
  try {
    const r = await kfetch(`/api/datos?key=${key}`);
    if (!r.ok) return fromCache(key, fallback);
    const text = await r.text();
    if (!text || text === 'null') return fromCache(key, fallback);
    const parsed = JSON.parse(text) as T;
    toCache(key, parsed);
    return parsed;
  } catch { return fromCache(key, fallback); }
}

export async function kvSet<T>(key: DataKey, data: T): Promise<boolean> {
  toCache(key, data);
  try {
    const r = await kfetch(`/api/datos?key=${key}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    return r.ok;
  } catch { return false; }
}

// ── Trazabilidad ──────────────────────────────────────────────────────────────

export async function trazaGet(): Promise<Traza[]> {
  try {
    const r = await kfetch('/api/trazabilidad');
    if (!r.ok) return fromCache('trazabilidad', []);
    const arr = JSON.parse(await r.text()) as Traza[];
    toCache('trazabilidad', arr);
    return arr;
  } catch { return fromCache('trazabilidad', []); }
}

export async function trazaPost(entrada: Omit<Traza, 'id' | 'fecha'>): Promise<void> {
  const payload: Omit<Traza, 'id'> = {
    ...entrada,
    fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
  };
  try {
    await kfetch('/api/trazabilidad', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  } catch { /* noop */ }
}
