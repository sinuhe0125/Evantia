import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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

export function ProtectedRoute() {
  const { isAuthenticated, authUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Verificar acceso por rol al intentar acceder a una ruta concreta
  const modulo = location.pathname.substring(1) || 'dashboard';
  const rol = authUser?.rol ?? 'Operador';
  const permitidos = ACCESO_POR_ROL[rol] ?? ACCESO_POR_ROL.Operador;

  if (modulo && modulo !== '' && !permitidos.includes(modulo)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
