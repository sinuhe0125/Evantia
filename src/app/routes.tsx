import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./components/Dashboard";
import { Usuarios } from "./pages/Usuarios";
import { Trabajadores } from "./components/Trabajadores";
import { Roles } from "./components/Roles";
import { Proyectos } from "./components/Proyectos";
import { Reportes } from "./pages/Reportes";
import { Trazabilidad } from "./pages/Trazabilidad";
import { Notificaciones } from "./pages/Notificaciones";
import { Seguimiento } from "./pages/Seguimiento";
import { Evaluaciones } from "./pages/Evaluaciones";
import { Cargos } from "./pages/Cargos";
import { Configuracion } from "./components/Configuracion";
import { PerfilUsuario } from "./pages/PerfilUsuario";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  // Ruta pública: login
  {
    path: "/login",
    element: <Login />,
  },

  // Rutas protegidas: todas pasan por ProtectedRoute
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Raíz redirige a dashboard (ya dentro del guard)
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard",     element: <Dashboard /> },
          { path: "usuarios",      element: <Usuarios /> },
          { path: "trabajadores",  element: <Trabajadores /> },
          { path: "roles",         element: <Roles /> },
          { path: "proyectos",     element: <Proyectos /> },
          { path: "reportes",      element: <Reportes /> },
          { path: "trazabilidad",  element: <Trazabilidad /> },
          { path: "notificaciones",element: <Notificaciones /> },
          { path: "seguimiento",   element: <Seguimiento /> },
          { path: "evaluaciones",  element: <Evaluaciones /> },
          { path: "cargos",        element: <Cargos /> },
          { path: "configuracion", element: <Configuracion /> },
          { path: "perfil",        element: <PerfilUsuario /> },
        ],
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <NotFound />,
  },
]);
