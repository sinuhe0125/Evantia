import { useApp } from '../context/AppContext';
import { Users, FolderKanban, AlertCircle, TrendingUp, CheckCircle, Pause, User, Briefcase, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { proyectos, trabajadores } = useApp();

  // Estadísticas calculadas desde el contexto real
  const enProgreso = proyectos.filter(p => p.estado === 'En Progreso').length;
  const completados = proyectos.filter(p => p.estado === 'Completado').length;
  const planificados = proyectos.filter(p => p.estado === 'Planificado').length;

  const avancePromedio = proyectos.length > 0
    ? Math.round(proyectos.reduce((sum, p) => sum + p.progreso, 0) / proyectos.length)
    : 0;

  // Proyectos por estado para gráfico de pastel
  const proyectosPorEstado = [
    { nombre: 'En Progreso', cantidad: enProgreso, color: '#2563eb' },
    { nombre: 'Completados', cantidad: completados, color: '#10b981' },
    { nombre: 'Planificados', cantidad: planificados, color: '#64748b' },
  ].filter(e => e.cantidad > 0);

  // Últimos avances desde el contexto (top 5 en progreso)
  const ultimosAvances = proyectos
    .filter(p => p.estado === 'En Progreso')
    .sort((a, b) => b.progreso - a.progreso)
    .slice(0, 5);

  // Proyectos por responsable
  const responsableMap: Record<string, number> = {};
  proyectos.forEach(p => {
    if (p.responsable) {
      responsableMap[p.responsable] = (responsableMap[p.responsable] || 0) + 1;
    }
  });
  const proyectosPorPM = Object.entries(responsableMap)
    .map(([pm, cantidad]) => ({ pm, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Proyectos por trabajador
  const trabajadorMap: Record<number, number> = {};
  proyectos.forEach(p => {
    p.trabajadoresAsignados.forEach(id => {
      trabajadorMap[id] = (trabajadorMap[id] || 0) + 1;
    });
  });
  const proyectosPorDesarrollador = Object.entries(trabajadorMap)
    .map(([id, proyectosCount]) => {
      const t = trabajadores.find(t => t.id === Number(id));
      return { desarrollador: t?.nombre || `ID ${id}`, proyectos: proyectosCount };
    })
    .sort((a, b) => b.proyectos - a.proyectos)
    .slice(0, 5);

  const COLORS = ['#2563eb', '#10b981', '#64748b'];

  const statsCards = [
    { title: 'Total Proyectos', value: String(proyectos.length), icon: FolderKanban, color: 'bg-blue-600', change: `${enProgreso} en progreso` },
    { title: 'Avance Promedio', value: `${avancePromedio}%`, icon: TrendingUp, color: 'bg-blue-500', change: `${completados} proyectos completados` },
    { title: 'Trabajadores', value: String(trabajadores.length), icon: User, color: 'bg-blue-700', change: `Asignados a proyectos` },
    { title: 'Proyectos Activos', value: String(enProgreso), icon: AlertCircle, color: 'bg-cyan-600', change: `${planificados} planificados` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-slate-800">Panel de Control</h2>
        <p className="text-slate-600 mt-1">Resumen general de proyectos y actividades</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-3xl mt-2 text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-cyan-600" />
              Proyectos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proyectosPorEstado.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={proyectosPorEstado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                      outerRadius={100}
                      dataKey="cantidad"
                    >
                      {proyectosPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {proyectosPorEstado.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-2xl text-slate-900">{item.cantidad}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.nombre}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">No hay proyectos registrados</div>
            )}
          </CardContent>
        </Card>

        {/* Avances de Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              Avance de Proyectos en Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ultimosAvances.length > 0 ? (
              <div className="space-y-4">
                {ultimosAvances.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{item.nombre}</span>
                      <span className="text-sm font-medium text-slate-900">{item.progreso}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full transition-all rounded-full"
                        style={{ width: `${item.progreso}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">No hay proyectos en progreso</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600" />
              Proyectos por Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proyectosPorPM.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={proyectosPorPM}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pm" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0891b2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600" />
              Proyectos por Trabajador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proyectosPorDesarrollador.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={proyectosPorDesarrollador}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="desarrollador" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="proyectos" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Proyectos Completados</p>
                <p className="text-2xl text-slate-800 mt-1">{completados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">En Progreso</p>
                <p className="text-2xl text-slate-800 mt-1">{enProgreso}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Pause className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Planificados</p>
                <p className="text-2xl text-slate-800 mt-1">{planificados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
