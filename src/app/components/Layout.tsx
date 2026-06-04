import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';

export function Layout() {
  const { authUser } = useApp();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-slate-800">DevStream Pro</h1>
              <p className="text-sm text-slate-500">Sistema de Gestión de Proyectos de Software</p>
            </div>
            {authUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-700">DevStream Technologies</p>
                  <p className="text-xs text-slate-500">{authUser.rol} — {authUser.nombre}</p>
                </div>
                <Link to="/perfil">
                  <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                    {authUser.iniciales}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
