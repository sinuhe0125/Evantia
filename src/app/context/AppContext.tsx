import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  dbGetUsuarios, dbSetUsuarios, dbConfigured, USUARIOS_DEFAULT,
  kvGet, kvSet, type UsuarioDB
} from '../services/db';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Cargo {
  id: number; nombre: string; descripcion: string; categoria: string; activo: boolean;
}
export interface Trabajador {
  id: number; nombre: string; cargo: string; email: string; telefono: string; tecnologias: string[];
}
export interface Proyecto {
  id: number; nombre: string; descripcion: string; fechaInicio: string; fechaFin: string;
  tipoSprint: '2 semanas' | '3 semanas' | '1 mes'; totalSprints: number; estado: string;
  presupuesto: number; responsable: string; trabajadoresAsignados: number[]; progreso: number;
}
export type Usuario = UsuarioDB;
export interface Rol {
  id: number; nombre: string; descripcion: string; permisos: string[]; usuarios: number; activo: boolean;
}
export interface AuthUser {
  nombre: string; email: string; rol: string; iniciales: string;
}

// ─── Datos iniciales ──────────────────────────────────────────────────────────

const cargosIniciales: Cargo[] = [
  { id:1, nombre:'Desarrollador Fullstack',      descripcion:'Desarrollo tanto en frontend como backend', categoria:'Desarrollo',      activo:true  },
  { id:2, nombre:'Desarrollador Frontend',        descripcion:'Desarrollo de interfaces de usuario',       categoria:'Desarrollo',      activo:true  },
  { id:3, nombre:'Desarrollador Backend',          descripcion:'Desarrollo de servicios y APIs',            categoria:'Desarrollo',      activo:true  },
  { id:4, nombre:'Desarrollador de Aplicaciones', descripcion:'Desarrollo de aplicaciones móviles',        categoria:'Desarrollo',      activo:true  },
  { id:5, nombre:'Analista',                       descripcion:'Análisis de requerimientos y procesos',     categoria:'Análisis',        activo:true  },
  { id:6, nombre:'Project Manager',                descripcion:'Gestión y coordinación de proyectos',       categoria:'Gestión',         activo:true  },
  { id:7, nombre:'QA Engineer',                    descripcion:'Aseguramiento de calidad y pruebas',        categoria:'Calidad',         activo:true  },
  { id:8, nombre:'DevOps Engineer',                descripcion:'Infraestructura y CI/CD',                   categoria:'Infraestructura', activo:false },
];

const trabajadoresIniciales: Trabajador[] = [
  { id:1, nombre:'Juan Pérez',     cargo:'Desarrollador Fullstack',      email:'juan.perez@email.com',     telefono:'+56 9 8888 1111', tecnologias:['React','Node.js','PostgreSQL','TypeScript'] },
  { id:2, nombre:'María González', cargo:'Desarrollador Frontend',        email:'maria.gonzalez@email.com', telefono:'+56 9 7777 2222', tecnologias:['React','Vue.js','Tailwind CSS','JavaScript'] },
  { id:3, nombre:'Carlos Rojas',   cargo:'Desarrollador Backend',          email:'carlos.rojas@email.com',   telefono:'+56 9 6666 3333', tecnologias:['Python','Django','FastAPI','MongoDB'] },
  { id:4, nombre:'Ana Silva',       cargo:'Desarrollador de Aplicaciones', email:'ana.silva@email.com',       telefono:'+56 9 5555 4444', tecnologias:['React Native','Flutter','Firebase','Swift'] },
  { id:5, nombre:'Laura Martínez', cargo:'Analista',                       email:'laura.martinez@email.com', telefono:'+56 9 4444 5555', tecnologias:[] },
  { id:6, nombre:'Roberto Díaz',   cargo:'Project Manager',                email:'roberto.diaz@email.com',   telefono:'+56 9 3333 6666', tecnologias:[] },
];

function cs(fi:string,ff:string,t:'2 semanas'|'3 semanas'|'1 mes'){
  const d={'2 semanas':14,'3 semanas':21,'1 mes':30};
  const diff=(new Date(ff).getTime()-new Date(fi).getTime())/86400000;
  return diff<=0?0:Math.max(1,Math.round(diff/d[t]));
}

const proyectosIniciales: Proyecto[] = [
  {id:1,nombre:'Sistema de Gestión ERP',descripcion:'ERP con módulos de contabilidad, inventario y RRHH',fechaInicio:'2024-01-15',fechaFin:'2024-12-30',tipoSprint:'2 semanas',totalSprints:cs('2024-01-15','2024-12-30','2 semanas'),estado:'En Progreso',presupuesto:85000000,responsable:'Juan Pérez',trabajadoresAsignados:[1,2,3],progreso:65},
  {id:2,nombre:'App Móvil Bancaria',descripcion:'Aplicación móvil nativa iOS/Android con seguridad biométrica',fechaInicio:'2024-02-01',fechaFin:'2024-11-15',tipoSprint:'3 semanas',totalSprints:cs('2024-02-01','2024-11-15','3 semanas'),estado:'En Progreso',presupuesto:62000000,responsable:'María González',trabajadoresAsignados:[2,4],progreso:42},
  {id:3,nombre:'Plataforma E-commerce',descripcion:'Comercio electrónico con integración de pagos',fechaInicio:'2023-10-10',fechaFin:'2024-05-20',tipoSprint:'1 mes',totalSprints:cs('2023-10-10','2024-05-20','1 mes'),estado:'En Progreso',presupuesto:48000000,responsable:'Carlos Rojas',trabajadoresAsignados:[1,3,5],progreso:88},
  {id:4,nombre:'Portal de Clientes',descripcion:'Portal web con dashboard y reportería en tiempo real',fechaInicio:'2024-03-01',fechaFin:'2024-09-30',tipoSprint:'2 semanas',totalSprints:cs('2024-03-01','2024-09-30','2 semanas'),estado:'En Progreso',presupuesto:28000000,responsable:'Ana Silva',trabajadoresAsignados:[4,5],progreso:28},
  {id:5,nombre:'API Gateway Microservicios',descripcion:'Gateway de APIs con OAuth2 y rate limiting',fechaInicio:'2024-02-15',fechaFin:'2024-08-31',tipoSprint:'3 semanas',totalSprints:cs('2024-02-15','2024-08-31','3 semanas'),estado:'En Progreso',presupuesto:35000000,responsable:'Laura Martínez',trabajadoresAsignados:[1,2],progreso:55},
  {id:6,nombre:'Sistema CRM Empresarial',descripcion:'CRM completo para ventas, marketing y atención al cliente',fechaInicio:'2023-08-01',fechaFin:'2024-02-28',tipoSprint:'2 semanas',totalSprints:cs('2023-08-01','2024-02-28','2 semanas'),estado:'Completado',presupuesto:52000000,responsable:'Roberto Díaz',trabajadoresAsignados:[3,4,6],progreso:100},
  {id:7,nombre:'Dashboard Analytics BI',descripcion:'Business Intelligence con visualización interactiva',fechaInicio:'2023-11-01',fechaFin:'2024-03-15',tipoSprint:'1 mes',totalSprints:cs('2023-11-01','2024-03-15','1 mes'),estado:'Completado',presupuesto:38000000,responsable:'Roberto Díaz',trabajadoresAsignados:[2,5,6],progreso:100},
  {id:8,nombre:'Sistema de Reservas SaaS',descripcion:'Plataforma SaaS multi-tenant para reservas online',fechaInicio:'2024-05-01',fechaFin:'2024-12-31',tipoSprint:'2 semanas',totalSprints:cs('2024-05-01','2024-12-31','2 semanas'),estado:'Planificado',presupuesto:45000000,responsable:'Laura Martínez',trabajadoresAsignados:[],progreso:0},
];

const rolesIniciales: Rol[] = [
  { id:1, nombre:'Administrador',  descripcion:'Acceso total al sistema',         permisos:['Crear','Editar','Eliminar','Ver'], usuarios:3,  activo:true  },
  { id:2, nombre:'Project Manager',descripcion:'Gestión de proyectos y equipos',  permisos:['Crear','Editar','Ver'],           usuarios:5,  activo:true  },
  { id:3, nombre:'Desarrollador',  descripcion:'Acceso a proyectos asignados',    permisos:['Ver','Editar'],                   usuarios:12, activo:true  },
  { id:4, nombre:'Analista',       descripcion:'Acceso a reportes y análisis',    permisos:['Ver'],                            usuarios:4,  activo:true  },
  { id:5, nombre:'Invitado',       descripcion:'Acceso limitado de solo lectura', permisos:['Ver'],                            usuarios:2,  activo:false },
];

// ─── Sesión ───────────────────────────────────────────────────────────────────

function loadSession(): AuthUser | null {
  try { const r = sessionStorage.getItem('auth'); return r ? JSON.parse(r) as AuthUser : null; }
  catch { return null; }
}
function saveSession(u: AuthUser | null) {
  try { u ? sessionStorage.setItem('auth', JSON.stringify(u)) : sessionStorage.removeItem('auth'); }
  catch { /* noop */ }
}
function initials(n: string) { return n.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase(); }

// ─── Contexto ─────────────────────────────────────────────────────────────────

interface Ctx {
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  dbReady: boolean;
  cargos: Cargo[];       setCargos: (v: Cargo[]) => Promise<void>;
  cargosActivos: Cargo[];
  trabajadores: Trabajador[]; setTrabajadores: (v: Trabajador[]) => Promise<void>;
  proyectos: Proyecto[];      setProyectos: (v: Proyecto[]) => Promise<void>;
  usuarios: Usuario[];        setUsuarios: (v: Usuario[]) => Promise<void>;
  roles: Rol[];               setRoles: (v: Rol[]) => Promise<void>;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser,     setAuthUser]     = useState<AuthUser | null>(loadSession);
  const [dbReady,      setDbReady]      = useState(false);
  const [usuarios,     setUsuariosState]= useState<Usuario[]>(USUARIOS_DEFAULT);
  const [cargos,       setCargosState]  = useState<Cargo[]>(cargosIniciales);
  const [trabajadores, setTrabajadoresState] = useState<Trabajador[]>(trabajadoresIniciales);
  const [proyectos,    setProyectosState]    = useState<Proyecto[]>(proyectosIniciales);
  const [roles,        setRolesState]        = useState<Rol[]>(rolesIniciales);

  // Cargar todos los datos desde KV al arrancar
  useEffect(() => {
    Promise.all([
      dbGetUsuarios(),
      kvGet('cargos',       cargosIniciales),
      kvGet('trabajadores', trabajadoresIniciales),
      kvGet('proyectos',    proyectosIniciales),
      kvGet('roles',        rolesIniciales),
    ]).then(([u, c, t, p, r]) => {
      setUsuariosState(u);
      setCargosState(c);
      setTrabajadoresState(t);
      setProyectosState(p);
      setRolesState(r);
      setDbReady(true);
    });
  }, []);

  useEffect(() => { saveSession(authUser); }, [authUser]);

  // Setters que actualizan estado + KV
  const setUsuarios     = useCallback(async (v: Usuario[])     => { setUsuariosState(v);     await dbSetUsuarios(v); }, []);
  const setCargos       = useCallback(async (v: Cargo[])       => { setCargosState(v);       await kvSet('cargos', v); }, []);
  const setTrabajadores = useCallback(async (v: Trabajador[])  => { setTrabajadoresState(v); await kvSet('trabajadores', v); }, []);
  const setProyectos    = useCallback(async (v: Proyecto[])    => { setProyectosState(v);    await kvSet('proyectos', v); }, []);
  const setRoles        = useCallback(async (v: Rol[])         => { setRolesState(v);        await kvSet('roles', v); }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const lista = await dbGetUsuarios();
    setUsuariosState(lista);
    const found = lista.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!found) return false;
    const user: AuthUser = { nombre: found.nombre, email: found.email, rol: found.rol, iniciales: initials(found.nombre) };
    setAuthUser(user);
    saveSession(user);
    return true;
  }, []);

  const logout = useCallback(() => { setAuthUser(null); saveSession(null); }, []);

  return (
    <AppContext.Provider value={{
      authUser, login, logout,
      isAuthenticated: authUser !== null,
      dbReady,
      cargos, setCargos, cargosActivos: cargos.filter(c => c.activo),
      trabajadores, setTrabajadores,
      proyectos, setProyectos,
      usuarios, setUsuarios,
      roles, setRoles,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
