import { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, LogIn, LogOut, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { trazaGet, type Traza } from '../services/db';

const ACCION_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Login:     { color: 'bg-green-100 text-green-700',  icon: <LogIn  className="h-3 w-3" /> },
  Logout:    { color: 'bg-slate-100 text-slate-600',  icon: <LogOut className="h-3 w-3" /> },
  Modificar: { color: 'bg-cyan-100 text-cyan-700',    icon: <Edit   className="h-3 w-3" /> },
  Crear:     { color: 'bg-blue-100 text-blue-700',    icon: <Plus   className="h-3 w-3" /> },
  Eliminar:  { color: 'bg-red-100 text-red-700',      icon: <Trash2 className="h-3 w-3" /> },
  Configurar:{ color: 'bg-amber-100 text-amber-700',  icon: <Settings className="h-3 w-3" /> },
};

const ROL_COLOR: Record<string, string> = {
  Administrador: 'bg-cyan-100 text-cyan-700',
  Supervisor:    'bg-sky-100 text-sky-700',
  Operador:      'bg-slate-100 text-slate-600',
};

export function Trazabilidad() {
  const [registros,   setRegistros]   = useState<Traza[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filtroAccion,setFiltroAccion]= useState('Todos');
  const [filtroModulo,setFiltroModulo]= useState('Todos');

  const cargar = async () => {
    setLoading(true);
    const data = await trazaGet();
    setRegistros(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const modulos = ['Todos', ...Array.from(new Set(registros.map(r => r.modulo)))];
  const acciones = ['Todos', ...Array.from(new Set(registros.map(r => r.accion)))];

  const filtrados = registros.filter(r => {
    const matchSearch = r.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.modulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAccion = filtroAccion === 'Todos' || r.accion === filtroAccion;
    const matchModulo = filtroModulo === 'Todos' || r.modulo === filtroModulo;
    return matchSearch && matchAccion && matchModulo;
  });

  const cfg = (accion: string) => ACCION_CONFIG[accion] ?? { color: 'bg-slate-100 text-slate-600', icon: <Activity className="h-3 w-3" /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Trazabilidad del Sistema</h2>
          <p className="text-slate-600 mt-1">Registro de todas las acciones realizadas por los usuarios</p>
        </div>
        <Button variant="outline" onClick={cargar} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Eventos',     value: registros.length,                                  color:'text-slate-800' },
          { label:'Inicios de Sesión', value: registros.filter(r=>r.accion==='Login').length,    color:'text-green-600' },
          { label:'Modificaciones',    value: registros.filter(r=>r.accion==='Modificar').length, color:'text-cyan-600'  },
          { label:'Eliminaciones',     value: registros.filter(r=>r.accion==='Eliminar').length,  color:'text-red-600'   },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{m.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="flex-1">Registro de Actividad</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-48" />
            </div>
            <Select value={filtroAccion} onValueChange={setFiltroAccion}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{acciones.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filtroModulo} onValueChange={setFiltroModulo}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{modulos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />Cargando...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay registros de actividad aún.</p>
              <p className="text-sm mt-1">Las acciones de los usuarios aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map(r => {
                  const c = cfg(r.accion);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">{r.fecha}</TableCell>
                      <TableCell className="font-medium text-slate-800">{r.usuario}</TableCell>
                      <TableCell><Badge className={ROL_COLOR[r.rol] ?? 'bg-slate-100 text-slate-600'}>{r.rol}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`${c.color} flex items-center gap-1 w-fit`}>
                          {c.icon}{r.accion}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline">{r.modulo}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">{r.descripcion}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
