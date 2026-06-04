import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCog, Briefcase, Shield, FolderKanban,
  BarChart3, Activity, Bell, ClipboardList, ClipboardCheck,
  Settings, LogOut, User, Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Permisos por módulo según rol
const ACCESO_POR_ROL: Record<string, string[]> = {
  Administrador: [
    'dashboard','usuarios','trabajadores','cargos','roles',
    'proyectos','seguimiento','evaluaciones','notificaciones',
    'reportes','trazabilidad','configuracion','perfil'
  ],
  Supervisor: [
    'dashboard','trabajadores','proyectos','seguimiento',
    'evaluaciones','notificaciones','reportes','perfil'
  ],
  Operador: [
    'dashboard','proyectos','seguimiento','perfil'
  ],
};

const menuItems = [
  { id: 'dashboard',     label: 'Inicio',          icon: LayoutDashboard },
  { id: 'usuarios',      label: 'Usuarios',         icon: UserCog         },
  { id: 'trabajadores',  label: 'Trabajadores',     icon: Briefcase       },
  { id: 'cargos',        label: 'Cargos',           icon: Tag             },
  { id: 'roles',         label: 'Roles',            icon: Shield          },
  { id: 'proyectos',     label: 'Proyectos',        icon: FolderKanban    },
  { id: 'seguimiento',   label: 'Seguimiento',      icon: ClipboardList   },
  { id: 'evaluaciones',  label: 'Evaluaciones',     icon: ClipboardCheck  },
  { id: 'notificaciones',label: 'Notificaciones',   icon: Bell            },
  { id: 'reportes',      label: 'Reportes',         icon: BarChart3       },
  { id: 'trazabilidad',  label: 'Trazabilidad',     icon: Activity        },
  { id: 'configuracion', label: 'Configuración',    icon: Settings        },
];

const ROL_BADGE: Record<string, string> = {
  Administrador: 'bg-cyan-100 text-cyan-700',
  Supervisor:    'bg-sky-100 text-sky-700',
  Operador:      'bg-slate-100 text-slate-600',
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, authUser } = useApp();

  const activeModule = location.pathname.substring(1) || 'dashboard';
  const rol = authUser?.rol ?? 'Operador';
  const acceso = ACCESO_POR_ROL[rol] ?? ACCESO_POR_ROL.Operador;

  const visibleItems = menuItems.filter(item => acceso.includes(item.id));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">DevStream</h2>
            <p className="text-xs text-cyan-600">Gestión de Proyectos</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-slate-200 space-y-1 flex-shrink-0">
        {/* Info usuario */}
        {authUser && (
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {authUser.iniciales}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 truncate">{authUser.nombre}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROL_BADGE[authUser.rol] ?? 'bg-slate-100 text-slate-600'}`}>
                  {authUser.rol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mi Perfil */}
        {acceso.includes('perfil') && (
          <Link
            to="/perfil"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
              activeModule === 'perfil'
                ? 'bg-cyan-50 text-cyan-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className={`h-4 w-4 flex-shrink-0 ${activeModule === 'perfil' ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span>Mi Perfil</span>
          </Link>
        )}

        {/* Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
