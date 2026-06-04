import { useState } from 'react';
import { ClipboardList, Plus, Edit, Trash2, Search, TrendingUp, AlertCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Proyectos disponibles (sincronizados con el módulo de Proyectos)
const proyectosDisponibles = [
  { id: 1, nombre: 'Sistema de Gestión ERP', responsable: 'Juan Pérez' },
  { id: 2, nombre: 'App Móvil Bancaria', responsable: 'María González' },
  { id: 3, nombre: 'Plataforma E-commerce', responsable: 'Carlos Ruiz' },
  { id: 4, nombre: 'Portal de Clientes', responsable: 'Ana López' },
  { id: 5, nombre: 'API Gateway Microservicios', responsable: 'Luis Martínez' },
  { id: 6, nombre: 'Sistema CRM Empresarial', responsable: 'Carmen Sánchez' },
  { id: 7, nombre: 'Dashboard Analytics BI', responsable: 'Roberto Díaz' },
  { id: 8, nombre: 'Sistema de Reservas SaaS', responsable: 'Patricia Torres' },
];

interface Seguimiento {
  id: number;
  proyectoId: number;
  fechaSeguimiento: string;
  actividadesRealizadas: string;
  obstaculos: string;
  avanceSemanal: number;
  comentarios: string;
  avanceTotal: number;
}

const mockSeguimientos: Seguimiento[] = [
  {
    id: 1,
    proyectoId: 1,
    fechaSeguimiento: '2026-04-08',
    actividadesRealizadas: 'Desarrollo de módulos de contabilidad y recursos humanos. Implementación de API REST. Testing de integración con sistemas legacy.',
    obstaculos: 'Retraso en la documentación de APIs del sistema legacy del cliente. Esperando respuesta del equipo técnico.',
    avanceSemanal: 15,
    comentarios: 'Proyecto avanza según cronograma ajustado. Se recomienda coordinar reunión técnica con el cliente para resolver dudas sobre integraciones.',
    avanceTotal: 65
  },
  {
    id: 2,
    proyectoId: 2,
    fechaSeguimiento: '2026-04-07',
    actividadesRealizadas: 'Desarrollo de pantallas de autenticación biométrica. Integración con servicios bancarios. Testing en dispositivos iOS y Android.',
    obstaculos: 'Cambios en los requerimientos de seguridad solicitados por el banco. Requiere refactorización del módulo de autenticación.',
    avanceSemanal: 10,
    comentarios: 'Se ajustará el cronograma considerando los nuevos requerimientos. El equipo está trabajando en la solución óptima.',
    avanceTotal: 42
  },
  {
    id: 3,
    proyectoId: 3,
    fechaSeguimiento: '2026-04-06',
    actividadesRealizadas: 'Implementación completa del carrito de compras. Integración con pasarelas de pago Webpay y Mercado Pago. Testing de flujos de compra.',
    obstaculos: 'Ninguno. El proyecto avanza sin inconvenientes.',
    avanceSemanal: 20,
    comentarios: 'Excelente progreso. La plataforma estará lista para lanzamiento en 2 semanas según lo planificado.',
    avanceTotal: 88
  },
  {
    id: 4,
    proyectoId: 1,
    fechaSeguimiento: '2026-04-01',
    actividadesRealizadas: 'Diseño de base de datos ERP. Configuración de entorno de desarrollo. Setup de repositorio y CI/CD pipeline.',
    obstaculos: 'Se encontraron problemas de rendimiento en consultas complejas que requerirán optimización de índices.',
    avanceSemanal: 12,
    comentarios: 'Los problemas de rendimiento están siendo atendidos por el equipo de backend. Se requiere revisión de arquitectura de datos.',
    avanceTotal: 50
  },
];

export function Seguimiento() {
  const [searchTerm, setSearchTerm] = useState('');
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>(mockSeguimientos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeguimiento, setEditingSeguimiento] = useState<Seguimiento | null>(null);
  const [formData, setFormData] = useState({
    proyectoId: 0,
    fechaSeguimiento: '',
    actividadesRealizadas: '',
    obstaculos: '',
    avanceSemanal: 0,
    comentarios: '',
    avanceTotal: 0
  });

  const getProyectoInfo = (proyectoId: number) => {
    return proyectosDisponibles.find(p => p.id === proyectoId);
  };

  const filteredSeguimientos = seguimientos.filter(s => {
    const proyecto = getProyectoInfo(s.proyectoId);
    return proyecto?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           proyecto?.responsable.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSeguimiento) {
      setSeguimientos(seguimientos.map(s => 
        s.id === editingSeguimiento.id 
          ? { ...formData, id: editingSeguimiento.id }
          : s
      ));
    } else {
      const nuevoSeguimiento: Seguimiento = {
        ...formData,
        id: Math.max(...seguimientos.map(s => s.id)) + 1,
      };
      setSeguimientos([nuevoSeguimiento, ...seguimientos]);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (seguimiento: Seguimiento) => {
    setEditingSeguimiento(seguimiento);
    setFormData(seguimiento);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setSeguimientos(seguimientos.filter(s => s.id !== id));
  };

  const resetForm = () => {
    setFormData({
      proyectoId: 0,
      fechaSeguimiento: '',
      actividadesRealizadas: '',
      obstaculos: '',
      avanceSemanal: 0,
      comentarios: '',
      avanceTotal: 0
    });
    setEditingSeguimiento(null);
  };

  const promedioAvanceTotal = seguimientos.length > 0 
    ? Math.round(seguimientos.reduce((sum, s) => sum + s.avanceTotal, 0) / seguimientos.length)
    : 0;

  const promedioAvanceSemanal = seguimientos.length > 0
    ? Math.round(seguimientos.reduce((sum, s) => sum + s.avanceSemanal, 0) / seguimientos.length)
    : 0;

  const seguimientosConObstaculos = seguimientos.filter(s => 
    s.obstaculos.toLowerCase() !== 'ninguno' && 
    s.obstaculos.toLowerCase() !== 'ninguno.' &&
    s.obstaculos.trim() !== ''
  ).length;

  const handleExportPDF = () => {
    console.log('Exportando seguimientos a PDF...');
    alert('Exportando reporte de seguimientos a PDF. Esta funcionalidad generaría un PDF con todos los registros de seguimiento.');
  };

  const handleExportExcel = () => {
    console.log('Exportando seguimientos a Excel...');
    alert('Exportando seguimientos a Excel. Esta funcionalidad generaría un archivo Excel con la tabla completa de seguimientos.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Seguimiento de Proyectos</h2>
          <p className="text-slate-600 mt-1">Registro y control de avances, actividades y obstáculos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Seguimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSeguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
              </DialogTitle>
              <DialogDescription>
                {editingSeguimiento ? 'Modifique los detalles del seguimiento.' : 'Complete la información del seguimiento del proyecto.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="proyectoId">Proyecto</Label>
                  <Select
                    value={formData.proyectoId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, proyectoId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectosDisponibles.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                          {proyecto.nombre} - {proyecto.responsable}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fechaSeguimiento">Fecha de Seguimiento</Label>
                  <Input
                    id="fechaSeguimiento"
                    type="date"
                    value={formData.fechaSeguimiento}
                    onChange={(e) => setFormData({ ...formData, fechaSeguimiento: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="avanceSemanal">Avance Semanal (%)</Label>
                  <Input
                    id="avanceSemanal"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avanceSemanal}
                    onChange={(e) => setFormData({ ...formData, avanceSemanal: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="actividadesRealizadas">Actividades Realizadas</Label>
                  <Textarea
                    id="actividadesRealizadas"
                    value={formData.actividadesRealizadas}
                    onChange={(e) => setFormData({ ...formData, actividadesRealizadas: e.target.value })}
                    placeholder="Describa las actividades realizadas durante esta semana..."
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="obstaculos">Obstáculos del Proyecto</Label>
                  <Textarea
                    id="obstaculos"
                    value={formData.obstaculos}
                    onChange={(e) => setFormData({ ...formData, obstaculos: e.target.value })}
                    placeholder="Describa los obstáculos encontrados (escriba 'Ninguno' si no hay obstáculos)..."
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="comentarios">Comentarios del Proyecto</Label>
                  <Textarea
                    id="comentarios"
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                    placeholder="Comentarios adicionales, recomendaciones o notas importantes..."
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="avanceTotal">% Total de Avance del Proyecto</Label>
                  <Input
                    id="avanceTotal"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avanceTotal}
                    onChange={(e) => setFormData({ ...formData, avanceTotal: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Porcentaje total de avance del proyecto hasta la fecha
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingSeguimiento ? 'Actualizar' : 'Crear Seguimiento'}
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
            <CardTitle className="text-sm">Total Seguimientos</CardTitle>
            <ClipboardList className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-slate-900">{seguimientos.length}</div>
            <p className="text-xs text-slate-500 mt-1">Registros totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avance Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-cyan-600">{promedioAvanceTotal}%</div>
            <p className="text-xs text-slate-500 mt-1">De todos los proyectos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avance Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{promedioAvanceSemanal}%</div>
            <p className="text-xs text-slate-500 mt-1">Promedio semanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Con Obstáculos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{seguimientosConObstaculos}</div>
            <p className="text-xs text-slate-500 mt-1">Proyectos con problemas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Seguimientos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Seguimientos</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar seguimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4 text-slate-600" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-600" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Actividades</TableHead>
                <TableHead>Obstáculos</TableHead>
                <TableHead>Avance Semanal</TableHead>
                <TableHead>Avance Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeguimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    No se encontraron seguimientos
                  </TableCell>
                </TableRow>
              ) : (
                filteredSeguimientos.map((seguimiento) => {
                  const proyecto = getProyectoInfo(seguimiento.proyectoId);
                  const tieneObstaculos = seguimiento.obstaculos.toLowerCase() !== 'ninguno' && 
                                         seguimiento.obstaculos.toLowerCase() !== 'ninguno.' &&
                                         seguimiento.obstaculos.trim() !== '';
                  
                  return (
                    <TableRow key={seguimiento.id}>
                      <TableCell className="font-medium">
                        {new Date(seguimiento.fechaSeguimiento).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {proyecto?.nombre}
                      </TableCell>
                      <TableCell>{proyecto?.responsable}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-slate-600 truncate" title={seguimiento.actividadesRealizadas}>
                          {seguimiento.actividadesRealizadas}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {tieneObstaculos ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 truncate" title={seguimiento.obstaculos}>
                              {seguimiento.obstaculos}
                            </p>
                          </div>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Sin obstáculos</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 w-16 overflow-hidden">
                            <div 
                              className="bg-cyan-600 h-full transition-all"
                              style={{ width: `${seguimiento.avanceSemanal}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-700">{seguimiento.avanceSemanal}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 w-16 overflow-hidden">
                            <div 
                              className="bg-green-600 h-full transition-all"
                              style={{ width: `${seguimiento.avanceTotal}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{seguimiento.avanceTotal}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(seguimiento)}
                          >
                            <Edit className="h-4 w-4 text-cyan-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(seguimiento.id)}
                          >
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

      {/* Detalles Expandidos */}
      {filteredSeguimientos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSeguimientos.slice(0, 4).map((seguimiento) => {
            const proyecto = getProyectoInfo(seguimiento.proyectoId);
            return (
              <Card key={seguimiento.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{proyecto?.nombre}</CardTitle>
                    <Badge variant="outline">{seguimiento.avanceTotal}% completado</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(seguimiento.fechaSeguimiento).toLocaleDateString('es-CL')} - {proyecto?.responsable}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500">Comentarios</Label>
                    <p className="text-sm text-slate-700 mt-1">{seguimiento.comentarios}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}