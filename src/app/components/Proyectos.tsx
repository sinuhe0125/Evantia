import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, Plus, Edit, Trash2, Search, Calendar, Users as UsersIcon, Clock, Filter, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';

type TipoSprint = '2 semanas' | '3 semanas' | '1 mes';
const SPRINT_DIAS: Record<TipoSprint, number> = { '2 semanas': 14, '3 semanas': 21, '1 mes': 30 };
const ESTADOS = ['Todos', 'Planificado', 'En Progreso', 'En Pausa', 'Completado'];

function calcularSprints(fi: string, ff: string, tipo: TipoSprint): number {
  if (!fi || !ff) return 0;
  const diff = (new Date(ff).getTime() - new Date(fi).getTime()) / 86400000;
  return diff <= 0 ? 0 : Math.max(1, Math.round(diff / SPRINT_DIAS[tipo]));
}

function formatDuracion(sprints: number, tipo: TipoSprint) {
  return sprints === 0 ? '—' : `${sprints} sprint${sprints !== 1 ? 's' : ''} de ${tipo}`;
}

const defaultForm = {
  nombre: '', descripcion: '', fechaInicio: '', fechaFin: '',
  tipoSprint: '2 semanas' as TipoSprint, totalSprints: 0,
  estado: 'Planificado', presupuesto: 0, responsableId: '',
  trabajadoresAsignados: [] as number[], progreso: 0,
};

const ESTADO_BADGE: Record<string, string> = {
  'Planificado': 'bg-slate-100 text-slate-700',
  'En Progreso': 'bg-cyan-100 text-cyan-700',
  'Completado':  'bg-green-100 text-green-700',
  'En Pausa':    'bg-yellow-100 text-yellow-700',
};

export function Proyectos() {
  const { proyectos, setProyectos, trabajadores } = useApp();

  const [searchTerm,    setSearchTerm]    = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('Todos');
  const [modalForm,     setModalForm]     = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [editando,      setEditando]      = useState<number | null>(null);
  const [proyectoElim,  setProyectoElim]  = useState<typeof proyectos[0] | null>(null);
  const [formData,      setFormData]      = useState({ ...defaultForm });
  const [fechaError,    setFechaError]    = useState('');
  const [saving,        setSaving]        = useState(false);

  const filtered = proyectos.filter(p => {
    const hayTrabajador = trabajadores
      .filter(t => p.trabajadoresAsignados.includes(t.id))
      .some(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hayTrabajador;
    return matchSearch && (filtroEstado === 'Todos' || p.estado === filtroEstado);
  });

  const updateSprints = (data: typeof formData) => ({
    ...data,
    totalSprints: calcularSprints(data.fechaInicio, data.fechaFin, data.tipoSprint),
  });

  const onFechaChange = (campo: 'fechaInicio' | 'fechaFin', val: string) => {
    const next = updateSprints({ ...formData, [campo]: val });
    setFormData(next);
    const fi = campo === 'fechaInicio' ? val : formData.fechaInicio;
    const ff = campo === 'fechaFin'    ? val : formData.fechaFin;
    setFechaError(fi && ff && new Date(ff) <= new Date(fi) ? 'La fecha de fin debe ser posterior a la de inicio.' : '');
  };

  const abrirCrear = () => {
    setEditando(null);
    setFormData({ ...defaultForm });
    setFechaError('');
    setModalForm(true);
  };

  const abrirEditar = (p: typeof proyectos[0]) => {
    setEditando(p.id);
    // Buscar responsable por nombre para preseleccionar
    const resp = trabajadores.find(t => t.nombre === p.responsable);
    setFormData({
      nombre: p.nombre, descripcion: p.descripcion,
      fechaInicio: p.fechaInicio, fechaFin: p.fechaFin,
      tipoSprint: p.tipoSprint, totalSprints: p.totalSprints,
      estado: p.estado, presupuesto: p.presupuesto,
      responsableId: resp ? String(resp.id) : '',
      trabajadoresAsignados: [...p.trabajadoresAsignados],
      progreso: p.progreso,
    });
    setFechaError('');
    setModalForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fechaError) return;
    setSaving(true);
    try {
      // Resolver nombre del responsable desde ID
      const resp = trabajadores.find(t => t.id === Number(formData.responsableId));
      const responsable = resp?.nombre ?? '';

      const payload = {
        nombre: formData.nombre, descripcion: formData.descripcion,
        fechaInicio: formData.fechaInicio, fechaFin: formData.fechaFin,
        tipoSprint: formData.tipoSprint,
        totalSprints: calcularSprints(formData.fechaInicio, formData.fechaFin, formData.tipoSprint),
        estado: formData.estado, presupuesto: formData.presupuesto,
        responsable, trabajadoresAsignados: formData.trabajadoresAsignados,
        progreso: formData.progreso,
      };

      if (editando !== null) {
        await setProyectos(
          proyectos.map(p => p.id === editando ? { ...payload, id: editando } : p),
          `Proyecto actualizado: ${payload.nombre}`
        );
      } else {
        const newId = proyectos.length > 0 ? Math.max(...proyectos.map(p => p.id)) + 1 : 1;
        await setProyectos(
          [...proyectos, { ...payload, id: newId }],
          `Proyecto creado: ${payload.nombre}`
        );
      }
      setModalForm(false);
    } finally { setSaving(false); }
  };

  const confirmarEliminar = async () => {
    if (!proyectoElim) return;
    setSaving(true);
    try {
      await setProyectos(
        proyectos.filter(p => p.id !== proyectoElim.id),
        `Proyecto eliminado: ${proyectoElim.nombre}`
      );
      setModalEliminar(false);
      setProyectoElim(null);
    } finally { setSaving(false); }
  };

  const toggleTrabajador = (id: number) => {
    const actual = formData.trabajadoresAsignados;
    setFormData({
      ...formData,
      trabajadoresAsignados: actual.includes(id) ? actual.filter(x => x !== id) : [...actual, id],
    });
  };

  // Stats
  const enProgreso  = proyectos.filter(p => p.estado === 'En Progreso').length;
  const completados = proyectos.filter(p => p.estado === 'Completado').length;
  const totalSprints = proyectos.reduce((s, p) => s + p.totalSprints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Proyectos</h2>
          <p className="text-slate-600 mt-1">Administración y seguimiento de proyectos</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={abrirCrear}>
          <Plus className="h-4 w-4 mr-2" />Nuevo Proyecto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total',       value:proyectos.length, icon:<FolderKanban className="h-5 w-5 text-cyan-600" />,  color:'text-slate-800' },
          { label:'En Progreso', value:enProgreso,        icon:<Calendar      className="h-5 w-5 text-cyan-600" />,  color:'text-cyan-600'  },
          { label:'Completados', value:completados,       icon:<FolderKanban  className="h-5 w-5 text-green-600" />, color:'text-green-600' },
          { label:'Sprints',     value:totalSprints,      icon:<Clock         className="h-5 w-5 text-slate-500" />, color:'text-slate-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">{s.label}</p><p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p></div>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">{s.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Lista de Proyectos</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-52" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Sprints</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0
                ? <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">Sin proyectos</TableCell></TableRow>
                : filtered.map(p => {
                  // Obtener trabajadores asignados desde la lista actual
                  const equipo = trabajadores.filter(t => p.trabajadoresAsignados.includes(t.id));
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800 max-w-[160px] truncate">{p.nombre}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{p.descripcion}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{p.responsable || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 mb-1">
                          <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-600">{equipo.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {equipo.slice(0, 2).map(t => (
                            <Badge key={t.id} variant="outline" className="text-xs bg-cyan-50 text-cyan-700 truncate max-w-[80px]" title={t.nombre}>
                              {t.nombre.split(' ')[0]}
                            </Badge>
                          ))}
                          {equipo.length > 2 && <Badge variant="outline" className="text-xs">+{equipo.length - 2}</Badge>}
                          {equipo.length === 0 && p.trabajadoresAsignados.length > 0 && (
                            <span className="text-xs text-amber-500">⚠ Sin coincidencia</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div>{new Date(p.fechaInicio).toLocaleDateString('es-CL')}</div>
                        <div>{new Date(p.fechaFin).toLocaleDateString('es-CL')}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{formatDuracion(p.totalSprints, p.tipoSprint)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${p.progreso}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 min-w-[28px]">{p.progreso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ESTADO_BADGE[p.estado] ?? 'bg-slate-100 text-slate-600'}>{p.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => abrirEditar(p)}><Edit className="h-4 w-4 text-cyan-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setProyectoElim(p); setModalEliminar(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={modalForm} onOpenChange={open => { setModalForm(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando !== null ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
            <DialogDescription>Complete todos los campos para {editando !== null ? 'actualizar' : 'crear'} el proyecto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <Label>Nombre del Proyecto</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre:e.target.value})} placeholder="Ej: Sistema ERP" required />
            </div>
            {/* Descripción */}
            <div>
              <Label>Descripción</Label>
              <Input value={formData.descripcion} onChange={e => setFormData({...formData, descripcion:e.target.value})} placeholder="Descripción breve" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Responsable — select de trabajadores reales */}
              <div>
                <Label>Responsable</Label>
                <Select value={formData.responsableId} onValueChange={v => setFormData({...formData, responsableId:v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {trabajadores.length === 0
                      ? <SelectItem value="none" disabled>Sin trabajadores registrados</SelectItem>
                      : trabajadores.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nombre} — {t.cargo}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              {/* Estado */}
              <div>
                <Label>Estado</Label>
                <Select value={formData.estado} onValueChange={v => setFormData({...formData, estado:v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Planificado','En Progreso','En Pausa','Completado'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Tipo Sprint */}
              <div>
                <Label>Tipo de Sprint</Label>
                <Select value={formData.tipoSprint} onValueChange={v => setFormData(updateSprints({...formData, tipoSprint:v as TipoSprint}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['2 semanas','3 semanas','1 mes'] as TipoSprint[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Presupuesto */}
              <div>
                <Label>Presupuesto (CLP)</Label>
                <Input type="number" min="0" value={formData.presupuesto} onChange={e => setFormData({...formData, presupuesto:parseInt(e.target.value)||0})} required />
              </div>
              {/* Fechas */}
              <div>
                <Label>Fecha de Inicio</Label>
                <Input type="date" value={formData.fechaInicio} onChange={e => onFechaChange('fechaInicio', e.target.value)} required />
              </div>
              <div>
                <Label>Fecha de Fin</Label>
                <Input type="date" value={formData.fechaFin} onChange={e => onFechaChange('fechaFin', e.target.value)} required />
              </div>
            </div>

            {/* Error fechas */}
            {fechaError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{fechaError}</p>}

            {/* Sprints calculados */}
            {formData.fechaInicio && formData.fechaFin && !fechaError && formData.totalSprints > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span className="text-sm text-cyan-800">Tiempo estimado: <strong>{formatDuracion(formData.totalSprints, formData.tipoSprint)}</strong></span>
              </div>
            )}

            {/* Progreso */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Progreso</Label>
                <span className="text-sm font-medium text-cyan-700">{formData.progreso}%</span>
              </div>
              <Slider min={0} max={100} step={5} value={[formData.progreso]} onValueChange={([v]) => setFormData({...formData, progreso:v})} />
            </div>

            {/* Trabajadores asignados — lista completa de trabajadores del sistema */}
            <div>
              <Label>Trabajadores Asignados</Label>
              {trabajadores.length === 0
                ? <p className="text-sm text-slate-400 mt-2 p-3 bg-slate-50 rounded-lg">No hay trabajadores registrados en el sistema.</p>
                : (
                  <div className="border rounded-lg p-3 mt-2 max-h-48 overflow-y-auto space-y-2">
                    {trabajadores.map(t => (
                      <div key={t.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`t-${t.id}`}
                          checked={formData.trabajadoresAsignados.includes(t.id)}
                          onCheckedChange={() => toggleTrabajador(t.id)}
                        />
                        <label htmlFor={`t-${t.id}`} className="text-sm cursor-pointer flex items-center gap-2 flex-1">
                          <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-xs font-semibold flex-shrink-0">
                            {t.nombre.split(' ').map((n:string) => n[0]).slice(0,2).join('')}
                          </div>
                          <span className="font-medium text-slate-700">{t.nombre}</span>
                          <Badge variant="outline" className="text-xs ml-auto">{t.cargo}</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                )
              }
              <p className="text-xs text-slate-400 mt-1">{formData.trabajadoresAsignados.length} trabajador(es) seleccionado(s)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setModalForm(false)}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={saving || !!fechaError}>
                {saving ? 'Guardando...' : editando !== null ? 'Actualizar' : 'Crear Proyecto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />Eliminar Proyecto
            </DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <p className="text-slate-700">¿Eliminar <strong>"{proyectoElim?.nombre}"</strong>? Todos sus datos se perderán.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalEliminar(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarEliminar} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
