import { useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const mockTrazabilidad = [
  {
    id: 1,
    fecha: '2026-03-01 09:15:23',
    usuario: 'María González',
    accion: 'Crear',
    modulo: 'Proyectos',
    descripcion: 'Creó el proyecto "Modernización Ascensores"',
    ip: '192.168.1.45',
    tipo: 'Creación'
  },
  {
    id: 2,
    fecha: '2026-03-01 09:10:12',
    usuario: 'Carlos Muñoz',
    accion: 'Editar',
    modulo: 'Pagos',
    descripcion: 'Actualizó el estado de pago #1234 a "Pagado"',
    ip: '192.168.1.67',
    tipo: 'Modificación'
  },
  {
    id: 3,
    fecha: '2026-03-01 08:45:30',
    usuario: 'María González',
    accion: 'Eliminar',
    modulo: 'Usuarios',
    descripcion: 'Eliminó el usuario "Pedro Ramírez"',
    ip: '192.168.1.45',
    tipo: 'Eliminación'
  },
  {
    id: 4,
    fecha: '2026-03-01 08:30:45',
    usuario: 'Carlos Muñoz',
    accion: 'Login',
    modulo: 'Sistema',
    descripcion: 'Inició sesión en el sistema',
    ip: '192.168.1.67',
    tipo: 'Acceso'
  },
  {
    id: 5,
    fecha: '2026-02-29 18:20:15',
    usuario: 'Ana Silva',
    accion: 'Crear',
    modulo: 'Visitantes',
    descripcion: 'Registró visita de "Juan Torres" a Depto 301',
    ip: '192.168.1.89',
    tipo: 'Creación'
  },
  {
    id: 6,
    fecha: '2026-02-29 17:45:00',
    usuario: 'María González',
    accion: 'Editar',
    modulo: 'Unidades',
    descripcion: 'Actualizó datos de la unidad "Depto 102"',
    ip: '192.168.1.45',
    tipo: 'Modificación'
  },
  {
    id: 7,
    fecha: '2026-02-29 16:30:25',
    usuario: 'Roberto Díaz',
    accion: 'Crear',
    modulo: 'Facturas',
    descripcion: 'Generó factura #5678 por mantención de áreas comunes',
    ip: '192.168.1.23',
    tipo: 'Creación'
  },
  {
    id: 8,
    fecha: '2026-02-29 15:15:40',
    usuario: 'Carlos Muñoz',
    accion: 'Exportar',
    modulo: 'Reportes',
    descripcion: 'Exportó reporte de pagos de Febrero 2026 a PDF',
    ip: '192.168.1.67',
    tipo: 'Exportación'
  },
  {
    id: 9,
    fecha: '2026-02-29 14:20:10',
    usuario: 'María González',
    accion: 'Editar',
    modulo: 'Proyectos',
    descripcion: 'Actualizó sprints pendientes del proyecto "Renovación Fachada"',
    ip: '192.168.1.45',
    tipo: 'Modificación'
  },
  {
    id: 10,
    fecha: '2026-02-29 13:05:55',
    usuario: 'Ana Silva',
    accion: 'Crear',
    modulo: 'Comunicados',
    descripcion: 'Publicó comunicado "Corte de agua programado"',
    ip: '192.168.1.89',
    tipo: 'Creación'
  },
];

export function Trazabilidad() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroModulo, setFiltroModulo] = useState('todos');

  const filteredData = mockTrazabilidad.filter(item => {
    const matchSearch = 
      item.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
    const matchModulo = filtroModulo === 'todos' || item.modulo === filtroModulo;

    return matchSearch && matchTipo && matchModulo;
  });

  const totalAcciones = mockTrazabilidad.length;
  const accionesHoy = mockTrazabilidad.filter(a => a.fecha.startsWith('2026-03-01')).length;
  const usuariosActivos = new Set(mockTrazabilidad.map(a => a.usuario)).size;

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Creación':
        return <Badge className="bg-green-100 text-green-700">Creación</Badge>;
      case 'Modificación':
        return <Badge className="bg-cyan-100 text-cyan-700">Modificación</Badge>;
      case 'Eliminación':
        return <Badge className="bg-red-100 text-red-700">Eliminación</Badge>;
      case 'Acceso':
        return <Badge className="bg-slate-100 text-slate-700">Acceso</Badge>;
      case 'Exportación':
        return <Badge className="bg-sky-100 text-sky-700">Exportación</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Trazabilidad del Sistema</h2>
          <p className="text-slate-600 mt-1">Auditoría de acciones y cambios realizados en el sistema</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Acciones</CardTitle>
            <Activity className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-slate-900">{totalAcciones}</div>
            <p className="text-xs text-slate-500 mt-1">Acciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Acciones Hoy</CardTitle>
            <Activity className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-cyan-600">{accionesHoy}</div>
            <p className="text-xs text-slate-500 mt-1">En las últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{usuariosActivos}</div>
            <p className="text-xs text-slate-500 mt-1">Usuarios con actividad</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Trazabilidad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registro de Auditoría</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar en trazabilidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Creación">Creación</SelectItem>
                  <SelectItem value="Modificación">Modificación</SelectItem>
                  <SelectItem value="Eliminación">Eliminación</SelectItem>
                  <SelectItem value="Acceso">Acceso</SelectItem>
                  <SelectItem value="Exportación">Exportación</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los módulos</SelectItem>
                  <SelectItem value="Proyectos">Proyectos</SelectItem>
                  <SelectItem value="Pagos">Pagos</SelectItem>
                  <SelectItem value="Usuarios">Usuarios</SelectItem>
                  <SelectItem value="Facturas">Facturas</SelectItem>
                  <SelectItem value="Visitantes">Visitantes</SelectItem>
                  <SelectItem value="Unidades">Unidades</SelectItem>
                  <SelectItem value="Comunicados">Comunicados</SelectItem>
                  <SelectItem value="Reportes">Reportes</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">#{item.id}</TableCell>
                    <TableCell className="text-sm text-slate-600">{item.fecha}</TableCell>
                    <TableCell className="font-medium text-slate-900">{item.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.accion}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{item.modulo}</TableCell>
                    <TableCell className="text-slate-600 max-w-xs">{item.descripcion}</TableCell>
                    <TableCell className="text-sm text-slate-500">{item.ip}</TableCell>
                    <TableCell>{getTipoBadge(item.tipo)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
