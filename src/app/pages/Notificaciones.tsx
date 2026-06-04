import { useState } from 'react';
import { Bell, Send, User, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

// Lista de Project Managers (filtrados del módulo de Trabajadores)
const projectManagers = [
  { id: 6, nombre: 'Roberto Díaz', email: 'roberto.diaz@email.com' },
];

// Lista de todos los trabajadores para notificaciones generales
const todosLosTrabajadores = [
  { id: 1, nombre: 'Juan Pérez', cargo: 'Desarrollador Fullstack', email: 'juan.perez@email.com' },
  { id: 2, nombre: 'María González', cargo: 'Desarrollador Frontend', email: 'maria.gonzalez@email.com' },
  { id: 3, nombre: 'Carlos Rojas', cargo: 'Desarrollador Backend', email: 'carlos.rojas@email.com' },
  { id: 4, nombre: 'Ana Silva', cargo: 'Desarrollador de Aplicaciones', email: 'ana.silva@email.com' },
  { id: 5, nombre: 'Laura Martínez', cargo: 'Analista', email: 'laura.martinez@email.com' },
  { id: 6, nombre: 'Roberto Díaz', cargo: 'Project Manager', email: 'roberto.diaz@email.com' },
];

interface Notificacion {
  id: number;
  asunto: string;
  mensaje: string;
  destinatarios: number[];
  prioridad: 'Alta' | 'Media' | 'Baja';
  fecha: string;
  estado: 'Enviada' | 'Pendiente' | 'Leída';
}

const mockNotificaciones: Notificacion[] = [
  {
    id: 1,
    asunto: 'Reunión de Seguimiento - Modernización Ascensores',
    mensaje: 'Se solicita reunión de seguimiento para revisar avances del proyecto.',
    destinatarios: [6],
    prioridad: 'Alta',
    fecha: '2026-04-08 09:30',
    estado: 'Enviada'
  },
  {
    id: 2,
    asunto: 'Actualización de Cronograma',
    mensaje: 'Favor actualizar el cronograma del proyecto con los últimos cambios.',
    destinatarios: [6],
    prioridad: 'Media',
    fecha: '2026-04-07 14:15',
    estado: 'Leída'
  },
  {
    id: 3,
    asunto: 'Solicitud de Reporte Mensual',
    mensaje: 'Se requiere el reporte mensual de todos los proyectos activos.',
    destinatarios: [6],
    prioridad: 'Alta',
    fecha: '2026-04-06 10:00',
    estado: 'Leída'
  },
];

export function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(mockNotificaciones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    asunto: '',
    mensaje: '',
    destinatarios: [] as number[],
    prioridad: 'Media' as 'Alta' | 'Media' | 'Baja',
    tipoDestinatario: 'pm' as 'pm' | 'custom'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevaNotificacion: Notificacion = {
      id: Math.max(...notificaciones.map(n => n.id)) + 1,
      asunto: formData.asunto,
      mensaje: formData.mensaje,
      destinatarios: formData.tipoDestinatario === 'pm' 
        ? projectManagers.map(pm => pm.id)
        : formData.destinatarios,
      prioridad: formData.prioridad,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
      estado: 'Enviada'
    };

    setNotificaciones([nuevaNotificacion, ...notificaciones]);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      asunto: '',
      mensaje: '',
      destinatarios: [],
      prioridad: 'Media',
      tipoDestinatario: 'pm'
    });
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return <Badge className="bg-red-100 text-red-700">Alta</Badge>;
      case 'Media':
        return <Badge className="bg-yellow-100 text-yellow-700">Media</Badge>;
      case 'Baja':
        return <Badge className="bg-green-100 text-green-700">Baja</Badge>;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Enviada':
        return <Badge className="bg-cyan-100 text-cyan-700">Enviada</Badge>;
      case 'Pendiente':
        return <Badge className="bg-slate-100 text-slate-700">Pendiente</Badge>;
      case 'Leída':
        return <Badge className="bg-green-100 text-green-700">Leída</Badge>;
      default:
        return null;
    }
  };

  const getDestinatariosNombres = (destinatarios: number[]) => {
    return todosLosTrabajadores
      .filter(t => destinatarios.includes(t.id))
      .map(t => t.nombre)
      .join(', ');
  };

  const totalEnviadas = notificaciones.filter(n => n.estado === 'Enviada').length;
  const totalLeidas = notificaciones.filter(n => n.estado === 'Leída').length;
  const totalPendientes = notificaciones.filter(n => n.estado === 'Pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Notificaciones</h2>
          <p className="text-slate-600 mt-1">Envío y gestión de notificaciones a Project Managers y equipo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Send className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Nueva Notificación</DialogTitle>
              <DialogDescription>
                Complete los detalles para enviar una notificación.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="asunto">Asunto</Label>
                <Input
                  id="asunto"
                  value={formData.asunto}
                  onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                  placeholder="Asunto de la notificación"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mensaje">Mensaje</Label>
                <Textarea
                  id="mensaje"
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Escriba el mensaje de la notificación..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value: 'Alta' | 'Media' | 'Baja') => 
                    setFormData({ ...formData, prioridad: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destinatarios</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tipo-pm"
                      checked={formData.tipoDestinatario === 'pm'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, tipoDestinatario: 'pm', destinatarios: [] });
                        }
                      }}
                    />
                    <Label htmlFor="tipo-pm" className="text-sm font-normal cursor-pointer">
                      Enviar a todos los Project Managers ({projectManagers.length})
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tipo-custom"
                      checked={formData.tipoDestinatario === 'custom'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, tipoDestinatario: 'custom', destinatarios: [] });
                        }
                      }}
                    />
                    <Label htmlFor="tipo-custom" className="text-sm font-normal cursor-pointer">
                      Seleccionar destinatarios específicos
                    </Label>
                  </div>

                  {formData.tipoDestinatario === 'custom' && (
                    <div className="border rounded-md p-4 mt-2 max-h-48 overflow-y-auto bg-slate-50">
                      <div className="space-y-2">
                        {todosLosTrabajadores.map(trabajador => (
                          <div key={trabajador.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`trabajador-${trabajador.id}`}
                              checked={formData.destinatarios.includes(trabajador.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ 
                                    ...formData, 
                                    destinatarios: [...formData.destinatarios, trabajador.id] 
                                  });
                                } else {
                                  setFormData({ 
                                    ...formData, 
                                    destinatarios: formData.destinatarios.filter(id => id !== trabajador.id) 
                                  });
                                }
                              }}
                            />
                            <Label 
                              htmlFor={`trabajador-${trabajador.id}`} 
                              className="text-sm font-normal cursor-pointer flex items-center gap-2"
                            >
                              <span>{trabajador.nombre}</span>
                              <Badge variant="outline" className="text-xs">{trabajador.cargo}</Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificación
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
            <CardTitle className="text-sm">Total Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-slate-900">{notificaciones.length}</div>
            <p className="text-xs text-slate-500 mt-1">Historial completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Enviadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-cyan-600">{totalEnviadas}</div>
            <p className="text-xs text-slate-500 mt-1">Notificaciones enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Leídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalLeidas}</div>
            <p className="text-xs text-slate-500 mt-1">Confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{totalPendientes}</div>
            <p className="text-xs text-slate-500 mt-1">Por enviar</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificaciones.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay notificaciones registradas
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div 
                  key={notif.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-slate-900">{notif.asunto}</h3>
                        {getPrioridadBadge(notif.prioridad)}
                        {getEstadoBadge(notif.estado)}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{notif.mensaje}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{notif.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{getDestinatariosNombres(notif.destinatarios)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
