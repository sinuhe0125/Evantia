/**
 * Base de datos compartida via Cloudflare Pages Function + KV.
 * Endpoint: /api/usuarios (mismo dominio, no necesita configuración).
 * Todos los navegadores comparten los mismos usuarios.
 */

const API = '/api/usuarios';
const CACHE_KEY = 'app_usuarios_v4';

export interface UsuarioDB {
  id: number; nombre: string; cargo: string;
  email: string; password: string; rol: string;
}

export const USUARIOS_DEFAULT: UsuarioDB[] = [
  { id:1, nombre:'María González', cargo:'Project Manager',       email:'admin@devstream.cl',   password:'Admin2024!', rol:'Administrador' },
  { id:2, nombre:'Roberto Díaz',   cargo:'Project Manager',       email:'roberto@devstream.cl', password:'Roberto123', rol:'Supervisor'    },
  { id:3, nombre:'Carlos Rojas',   cargo:'Desarrollador Backend', email:'carlos@devstream.cl',  password:'Carlos123',  rol:'Operador'      },
];

function parse(raw: string): UsuarioDB[] | null {
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) && a.length > 0 && a.every((u: UsuarioDB) => u.email && u.password && u.rol) ? a : null;
  } catch { return null; }
}

function fromCache(): UsuarioDB[] {
  const raw = localStorage.getItem(CACHE_KEY);
  return (raw && parse(raw)) || USUARIOS_DEFAULT;
}

function toCache(u: UsuarioDB[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(u));
}

export function dbConfigured(): boolean { return true; }

export async function dbGetUsuarios(): Promise<UsuarioDB[]> {
  try {
    const r = await fetch(API, { cache: 'no-store' });
    if (!r.ok) return fromCache();
    const parsed = parse(await r.text());
    if (parsed) { toCache(parsed); return parsed; }
    return fromCache();
  } catch {
    return fromCache();
  }
}

export async function dbSetUsuarios(usuarios: UsuarioDB[]): Promise<boolean> {
  toCache(usuarios);
  try {
    const r = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarios),
    });
    return r.ok;
  } catch { return false; }
}
