import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, Plus, Edit, Trash2, Search, Calendar, Users as UsersIcon, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';

type TipoSprint = '2 semanas' | '3 semanas' | '1 mes';

const sprintDiasDuracion: Record<TipoSprint, number> = {
  '2 semanas': 14,
  '3 semanas': 21,
  '1 mes': 30,
};

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  tipoSprint: TipoSprint;
  totalSprints: number;
  estado: string;
  presupuesto: number;
  responsable: string;
  trabajadoresAsignados: number[];
  progreso: number;
}

function calcularSprints(fechaInicio: string, fechaFin: string, tipoSprint: TipoSprint): number {
  if (!fechaInicio || !fechaFin) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffMs = fin.getTime() - inicio.getTime();
  if (diffMs <= 0) return 0;
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diffDias / sprintDiasDuracion[tipoSprint]));
}

function formatDuracion(totalSprints: number, tipoSprint: TipoSprint): string {
  if (totalSprints === 0) return '—';
  return `${totalSprints} sprint${totalSprints !== 1 ? 's' : ''} de ${tipoSprint}`;
}

const defaultForm = {
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  tipoSprint: '2 semanas' as TipoSprint,
  totalSprints: 0,
  estado: 'Planificado',
  presupuesto: 0,
  responsable: '',
  trabajadoresAsignados: [] as number[],
  progreso: 0,
};

const ESTADOS = ['Todos', 'Planificado', 'En Progreso', 'En Pausa', 'Completado'];

export function Proyectos() {
  const { proyectos, setProyectos, trabajadores: trabajadoresCtx } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [fechaError, setFechaError] = useState('');

  // Modal de confirmación de borrado
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);

  const updateSprintCalc = (data: typeof formData) => {
    const sprints = calcularSprints(data.fechaInicio, data.fechaFin, data.tipoSprint);
    return { ...data, totalSprints: sprints };
  };

  const handleFechaChange = (field: 'fechaInicio' | 'fechaFin', value: string) => {
    const updated = updateSprintCalc({ ...formData, [field]: value });
    setFormData(updated);
    // Validar que fin > inicio
    const inicio = field === 'fechaInicio' ? value : formData.fechaInicio;
    const fin    = field === 'fechaFin'    ? value : formData.fechaFin;
    if (inicio && fin && new Date(fin) <= new Date(inicio)) {
      setFechaError('La fecha de fin debe ser posterior a la fecha de inicio.');
    } else {
      setFechaError('');
    }
  };

  const handleSprintChange = (value: TipoSprint) => {
    const updated = updateSprintCalc({ ...formData, tipoSprint: value });
    setFormData(updated);
  };

  const filteredProyectos = proyectos.filter(p => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const totalProyectos = proyectos.length;
  const enProgreso  = proyectos.filter(p => p.estado === 'En Progreso').length;
  const completados = proyectos.filter(p => p.estado === 'Completado').length;
  const totalSprints = proyectos.reduce((sum, p) => sum + p.totalSprints, 0);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Planificado': return <Badge className="bg-slate-100 text-slate-700">Planificado</Badge>;
      case 'En Progreso': return <Badge className="bg-cyan-100 text-cyan-700">En Progreso</Badge>;
      case 'Completado':  return <Badge className="bg-green-100 text-green-700">Completado</Badge>;
      case 'En Pausa':    return <Badge className="bg-yellow-100 text-yellow-700">En Pausa</Badge>;
      default: return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fechaError) return;
    if (formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      setFechaError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }
    if (editingProyecto) {
      setProyectos(proyectos.map(p => p.id === editingProyecto.id ? { ...formData, id: editingProyecto.id } : p));
    } else {
      const maxId = proyectos.length > 0 ? Math.max(...proyectos.map(p => p.id)) : 0;
      setProyectos([...proyectos, { ...formData, id: maxId + 1 }]);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setFormData({ ...proyecto });
    setFechaError('');
    setIsDialogOpen(true);
  };

  // Abre el dialog de confirmación en vez de borrar directo
  const handleDeleteRequest = (proyecto: Proyecto) => {
    setProyectoAEliminar(proyecto);
    setDeleteDialog(true);
  };

  const confirmarEliminar = () => {
    if (proyectoAEliminar) {
      setProyectos(proyectos.filter(p => p.id !== proyectoAEliminar.id));
    }
    setDeleteDialog(false);
    setProyectoAEliminar(null);
  };

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setEditingProyecto(null);
    setFechaError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Proyectos</h2>
          <p className="text-slate-600 mt-1">Administración y seguimiento de proyectos de software</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
              <DialogDescription>
                {editingProyecto ? 'Modifique los detalles del proyecto.' : 'Complete los datos para crear un nuevo proyecto.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nombre del Proyecto</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Sistema de Gestión ERP"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada del proyecto"
                    required
                  />
                </div>

                {/* Responsable: select vinculado a trabajadores reales */}
                <div>
                  <Label>Responsable</Label>
                  <Select
                    value={formData.responsable}
                    onValueChange={(value) => setFormData({ ...formData, responsable: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {trabajadoresCtx.map(t => (
                        <SelectItem key={t.id} value={t.nombre}>{t.nombre} — {t.cargo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planificado">Planificado</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="En Pausa">En Pausa</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Sprint</Label>
                  <Select value={formData.tipoSprint} onValueChange={(v) => handleSprintChange(v as TipoSprint)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 semanas">2 semanas</SelectItem>
                      <SelectItem value="3 semanas">3 semanas</SelectItem>
                      <SelectItem value="1 mes">1 mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Presupuesto (CLP)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label>Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleFechaChange('fechaInicio', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Fecha de Fin</Label>
                  <Input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => handleFechaChange('fechaFin', e.target.value)}
                    required
                  />
                </div>

                {/* Error de fechas */}
                {fechaError && (
                  <div className="col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {fechaError}
                  </div>
                )}

                {/* Tiempo estimado calculado */}
                {formData.fechaInicio && formData.fechaFin && formData.totalSprints > 0 && !fechaError && (
                  <div className="col-span-2">
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <Clock className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-cyan-800">
                          <span className="font-medium">Tiempo estimado: </span>
                          {formatDuracion(formData.totalSprints, formData.tipoSprint)}
                        </p>
                        <p className="text-xs text-cyan-600 mt-0.5">
                          Calculado con sprints de {formData.tipoSprint} entre las fechas seleccionadas
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progreso (slider) */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Progreso del Proyecto</Label>
                    <span className="text-sm font-medium text-cyan-700">{formData.progreso}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[formData.progreso]}
                    onValueChange={([v]) => setFormData({ ...formData, progreso: v })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Trabajadores asignados */}
                <div className="col-span-2">
                  <Label>Trabajadores Asignados</Label>
                  <div className="border rounded-md p-4 mt-2 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      {trabajadoresCtx.map(trabajador => (
                        <div key={trabajador.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`trabajador-${trabajador.id}`}
                            checked={formData.trabajadoresAsignados.includes(trabajador.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, trabajadoresAsignados: [...formData.trabajadoresAsignados, trabajador.id] });
                              } else {
                                setFormData({ ...formData, trabajadoresAsignados: formData.trabajadoresAsignados.filter(id => id !== trabajador.id) });
                              }
                            }}
                          />
                          <Label htmlFor={`trabajador-${trabajador.id}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-slate-500" />
                            <span>{trabajador.nombre}</span>
                            <Badge variant="outline" className="text-xs">{trabajador.cargo}</Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Seleccione uno o más trabajadores para asignar al proyecto</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={!!fechaError}>
                  {editingProyecto ? 'Actualizar' : 'Crear Proyecto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Proyectos</CardTitle>
            <FolderKanban className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-slate-900">{totalProyectos}</div>
            <p className="text-xs text-slate-500 mt-1">Proyectos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">En Progreso</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-cyan-600">{enProgreso}</div>
            <p className="text-xs text-slate-500 mt-1">Proyectos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completados</CardTitle>
            <FolderKanban className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{completados}</div>
            <p className="text-xs text-slate-500 mt-1">Proyectos finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Sprints</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-slate-900">{totalSprints}</div>
            <p className="text-xs text-slate-500 mt-1">En todos los proyectos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Lista de Proyectos</CardTitle>
            <div className="flex items-center gap-3">
              {/* Filtro por estado */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-56"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Tiempo Estimado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProyectos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-slate-500">No se encontraron proyectos</TableCell>
                </TableRow>
              ) : (
                filteredProyectos.map((proyecto) => {
                  const trabajadoresProyecto = trabajadoresCtx.filter(t => proyecto.trabajadoresAsignados.includes(t.id));
                  return (
                    <TableRow key={proyecto.id}>
                      <TableCell className="font-medium">#{proyecto.id}</TableCell>
                      <TableCell className="font-medium text-slate-900 max-w-[160px] truncate">{proyecto.nombre}</TableCell>
                      <TableCell>{proyecto.responsable}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-4 w-4 text-cyan-600" />
                          <span className="text-sm text-slate-700">{proyecto.trabajadoresAsignados.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trabajadoresProyecto.slice(0, 2).map(t => (
                            <Badge key={t.id} variant="outline" className="text-xs bg-cyan-50 text-cyan-700">{t.nombre.split(' ')[0]}</Badge>
                          ))}
                          {trabajadoresProyecto.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-slate-50">+{trabajadoresProyecto.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(proyecto.fechaInicio).toLocaleDateString('es-CL')}</TableCell>
                      <TableCell>{new Date(proyecto.fechaFin).toLocaleDateString('es-CL')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-cyan-500" />
                          <span className="text-sm text-slate-700 whitespace-nowrap">{formatDuracion(proyecto.totalSprints, proyecto.tipoSprint)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-cyan-600 h-full transition-all" style={{ width: `${proyecto.progreso}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 min-w-[30px]">{proyecto.progreso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(proyecto.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(proyecto)}>
                            <Edit className="h-4 w-4 text-cyan-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(proyecto)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog confirmación de borrado */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-slate-700">
              ¿Estás seguro de que quieres eliminar el proyecto{' '}
              <span className="font-medium text-slate-900">"{proyectoAEliminar?.nombre}"</span>?
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Se eliminarán todos sus datos y no podrás recuperarlos.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarEliminar}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
