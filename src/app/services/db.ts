/**
 * Servicio de base de datos compartida via Cloudflare KV.
 * Todos los datos (usuarios, proyectos, trabajadores, cargos, roles)
 * se leen y escriben en KV → compartidos entre todos los navegadores.
 * Fallback a localStorage si KV no está disponible.
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseArr(raw: string): unknown[] | null {
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : null; }
  catch { return null; }
}

function fromCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`kv_cache_${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch { return fallback; }
}

function toCache(key: string, data: unknown) {
  try { localStorage.setItem(`kv_cache_${key}`, JSON.stringify(data)); } catch { /* noop */ }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export function dbConfigured(): boolean { return true; }

export async function dbGetUsuarios(): Promise<UsuarioDB[]> {
  try {
    const r = await fetch('/api/usuarios', { cache: 'no-store' });
    if (!r.ok) return fromCache('usuarios', USUARIOS_DEFAULT);
    const arr = parseArr(await r.text()) as UsuarioDB[] | null;
    if (arr && arr.length > 0) { toCache('usuarios', arr); return arr; }
    return fromCache('usuarios', USUARIOS_DEFAULT);
  } catch { return fromCache('usuarios', USUARIOS_DEFAULT); }
}

export async function dbSetUsuarios(usuarios: UsuarioDB[]): Promise<boolean> {
  toCache('usuarios', usuarios);
  try {
    const r = await fetch('/api/usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarios),
    });
    return r.ok;
  } catch { return false; }
}

// ── Datos genéricos (proyectos, trabajadores, cargos, roles) ──────────────────

type DataKey = 'proyectos' | 'trabajadores' | 'cargos' | 'roles';

export async function kvGet<T>(key: DataKey, fallback: T): Promise<T> {
  try {
    const r = await fetch(`/api/datos?key=${key}`, { cache: 'no-store' });
    if (!r.ok) return fromCache(key, fallback);
    const text = await r.text();
    if (text === 'null' || !text) return fromCache(key, fallback);
    const parsed = JSON.parse(text) as T;
    if (parsed) { toCache(key, parsed); return parsed; }
    return fromCache(key, fallback);
  } catch { return fromCache(key, fallback); }
}

export async function kvSet<T>(key: DataKey, data: T): Promise<boolean> {
  toCache(key, data);
  try {
    const r = await fetch(`/api/datos?key=${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.ok;
  } catch { return false; }
}
