import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, FolderKanban, Users, Clock } from 'lucide-react';

const COLORES_ESTADO: Record<string, string> = {
  'En Progreso': '#0891b2',
  'Completado':  '#10b981',
  'Planificado': '#64748b',
  'En Pausa':    '#f59e0b',
};

const formatCLP = (valor: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor);

export function Reports() {
  const { proyectos, trabajadores } = useApp();

  // ── Métricas resumen ────────────────────────────────────────────────────────
  const presupuestoTotal = proyectos.reduce((s, p) => s + p.presupuesto, 0);
  const presupuestoEnProgreso = proyectos
    .filter(p => p.estado === 'En Progreso')
    .reduce((s, p) => s + p.presupuesto, 0);
  const avancePromedio = proyectos.length > 0
    ? Math.round(proyectos.reduce((s, p) => s + p.progreso, 0) / proyectos.length)
    : 0;
  const totalSprints = proyectos.reduce((s, p) => s + p.totalSprints, 0);

  // ── Proyectos por estado (pastel) ───────────────────────────────────────────
  const porEstado = Object.entries(
    proyectos.reduce<Record<string, number>>((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: COLORES_ESTADO[name] ?? '#94a3b8' }));

  // ── Presupuesto por proyecto (barras, top 8) ────────────────────────────────
  const presupuestoPorProyecto = [...proyectos]
    .sort((a, b) => b.presupuesto - a.presupuesto)
    .slice(0, 8)
    .map(p => ({
      nombre: p.nombre.length > 20 ? p.nombre.slice(0, 18) + '…' : p.nombre,
      presupuesto: p.presupuesto,
    }));

  // ── Avance por proyecto en progreso (barras) ────────────────────────────────
  const avancePorProyecto = proyectos
    .filter(p => p.estado === 'En Progreso')
    .sort((a, b) => b.progreso - a.progreso)
    .map(p => ({
      nombre: p.nombre.length > 20 ? p.nombre.slice(0, 18) + '…' : p.nombre,
      progreso: p.progreso,
    }));

  // ── Carga de trabajadores (proyectos asignados) ─────────────────────────────
  const cargaTrabajadores = trabajadores
    .map(t => ({
      nombre: t.nombre.split(' ')[0],
      proyectos: proyectos.filter(p => p.trabajadoresAsignados.includes(t.id)).length,
    }))
    .filter(t => t.proyectos > 0)
    .sort((a, b) => b.proyectos - a.proyectos)
    .slice(0, 8);

  // ── Sprints por tipo ────────────────────────────────────────────────────────
  const sprintsPorTipo = Object.entries(
    proyectos.reduce<Record<string, number>>((acc, p) => {
      acc[p.tipoSprint] = (acc[p.tipoSprint] || 0) + p.totalSprints;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-slate-800">Reportes y Análisis</h2>
        <p className="text-slate-600 mt-1">Métricas en tiempo real basadas en los proyectos registrados</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Presupuesto Total</p>
                <p className="text-xl mt-1 text-slate-800">{formatCLP(presupuestoTotal)}</p>
                <p className="text-xs text-slate-500 mt-2">{proyectos.length} proyectos</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Presupuesto Activo</p>
                <p className="text-xl mt-1 text-cyan-700">{formatCLP(presupuestoEnProgreso)}</p>
                <p className="text-xs text-slate-500 mt-2">Proyectos en progreso</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Avance Promedio</p>
                <p className="text-xl mt-1 text-slate-800">{avancePromedio}%</p>
                <p className="text-xs text-slate-500 mt-2">Todos los proyectos</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sprints</p>
                <p className="text-xl mt-1 text-slate-800">{totalSprints}</p>
                <p className="text-xs text-slate-500 mt-2">{trabajadores.length} trabajadores</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución estado + avance en progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {porEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={porEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {porEstado.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avance de Proyectos en Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            {avancePorProyecto.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avancePorProyecto} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="progreso" fill="#0891b2" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">No hay proyectos en progreso</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Presupuesto por proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto por Proyecto (CLP)</CardTitle>
        </CardHeader>
        <CardContent>
          {presupuestoPorProyecto.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={presupuestoPorProyecto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => formatCLP(v)} />
                <Bar dataKey="presupuesto" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Presupuesto" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">Sin datos</div>
          )}
        </CardContent>
      </Card>

      {/* Carga de trabajadores + sprints por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Carga por Trabajador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cargaTrabajadores.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cargaTrabajadores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} proyectos`, 'Asignados']} />
                  <Bar dataKey="proyectos" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">Sin asignaciones</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Sprints Totales por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sprintsPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sprintsPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} sprints`, 'Total']} />
                  <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} name="Sprints" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla resumen de proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          {proyectos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 text-slate-600 font-medium">Proyecto</th>
                    <th className="text-left py-3 px-2 text-slate-600 font-medium">Responsable</th>
                    <th className="text-left py-3 px-2 text-slate-600 font-medium">Estado</th>
                    <th className="text-right py-3 px-2 text-slate-600 font-medium">Presupuesto</th>
                    <th className="text-right py-3 px-2 text-slate-600 font-medium">Progreso</th>
                    <th className="text-right py-3 px-2 text-slate-600 font-medium">Equipo</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-800 max-w-[180px] truncate">{p.nombre}</td>
                      <td className="py-3 px-2 text-slate-600">{p.responsable}</td>
                      <td className="py-3 px-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: (COLORES_ESTADO[p.estado] ?? '#94a3b8') + '22',
                            color: COLORES_ESTADO[p.estado] ?? '#64748b',
                          }}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700">{formatCLP(p.presupuesto)}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-cyan-500 h-full rounded-full"
                              style={{ width: `${p.progreso}%` }}
                            />
                          </div>
                          <span className="text-slate-600 min-w-[32px]">{p.progreso}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">{p.trabajadoresAsignados.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">No hay proyectos registrados</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
