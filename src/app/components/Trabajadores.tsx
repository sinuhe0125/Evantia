import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Mail, Phone, Briefcase, Code, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useApp } from '../context/AppContext';
import type { Cargo, Trabajador } from '../context/AppContext';

const CARGOS_SIN_TECNOLOGIA = ['Analista', 'Project Manager'];
const FORM_VACÍO = { nombre: '', cargo: '', email: '', telefono: '', tecnologias: '' };
type FormValues = typeof FORM_VACÍO;

// ── Formulario definido FUERA del componente padre para evitar re-montaje ─────

function FormularioTrabajador({
  form, setForm, onSubmit, onCancel, esEdicion, cargosActivos,
}: {
  form: FormValues;
  setForm: (f: FormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  esEdicion: boolean;
  cargosActivos: Cargo[];
}) {
  const tecRequerida = form.cargo !== '' && !CARGOS_SIN_TECNOLOGIA.includes(form.cargo);

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre Completo</Label>
        <Input
          id="nombre"
          placeholder="Nombre y apellidos"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
      </div>

      {/* Cargo */}
      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <select
          id="cargo"
          value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value, tecnologias: '' })}
          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        >
          <option value="">Seleccionar cargo...</option>
          {cargosActivos.map(c => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Email + Teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="+56 9 1234 5678"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Tecnologías */}
      <div className="space-y-2">
        <Label htmlFor="tecnologias">
          Tecnologías que Domina
          {form.cargo && !tecRequerida && (
            <span className="ml-2 text-xs text-slate-400 font-normal">(Opcional para este cargo)</span>
          )}
        </Label>
        <Input
          id="tecnologias"
          placeholder="Ej: React, Node.js, Python (separadas por comas)"
          value={form.tecnologias}
          onChange={(e) => setForm({ ...form, tecnologias: e.target.value })}
          required={tecRequerida}
        />
        {form.cargo && (
          <p className="text-xs text-slate-500">
            {tecRequerida
              ? 'Ingrese las tecnologías separadas por comas'
              : 'El campo tecnologías es opcional para este cargo'}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
          {esEdicion ? 'Guardar Cambios' : 'Registrar Trabajador'}
        </Button>
      </div>
    </form>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function Trabajadores() {
  const { trabajadores, setTrabajadores, cargosActivos } = useApp();

  // Modal crear
  const [modalCrear, setModalCrear]   = useState(false);
  const [formCrear,  setFormCrear]    = useState<FormValues>(FORM_VACÍO);

  // Modal editar
  const [modalEditar,        setModalEditar]        = useState(false);
  const [trabajadorEditar,   setTrabajadorEditar]   = useState<Trabajador | null>(null);
  const [formEditar,         setFormEditar]         = useState<FormValues>(FORM_VACÍO);

  // Modal confirmar eliminar
  const [modalEliminar,      setModalEliminar]      = useState(false);
  const [trabajadorEliminar, setTrabajadorEliminar] = useState<Trabajador | null>(null);

  // ── Crear ────────────────────────────────────────────────────────────────

  const abrirCrear = () => {
    setFormCrear(FORM_VACÍO);
    setModalCrear(true);
  };

  const guardarCrear = (e: React.FormEvent) => {
    e.preventDefault();
    const techs = formCrear.tecnologias.split(',').map(t => t.trim()).filter(Boolean);
    const nuevo: Trabajador = {
      id: Math.max(0, ...trabajadores.map(t => t.id)) + 1,
      nombre:      formCrear.nombre,
      cargo:       formCrear.cargo,
      email:       formCrear.email,
      telefono:    formCrear.telefono,
      tecnologias: techs,
    };
    setTrabajadores([...trabajadores, nuevo]);
    setModalCrear(false);
    setFormCrear(FORM_VACÍO);
  };

  // ── Editar ───────────────────────────────────────────────────────────────

  const abrirEditar = (t: Trabajador) => {
    setTrabajadorEditar(t);
    setFormEditar({
      nombre:      t.nombre,
      cargo:       t.cargo,
      email:       t.email,
      telefono:    t.telefono,
      tecnologias: t.tecnologias.join(', '),
    });
    setModalEditar(true);
  };

  const guardarEditar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajadorEditar) return;
    const techs = formEditar.tecnologias.split(',').map(t => t.trim()).filter(Boolean);
    setTrabajadores(trabajadores.map(t =>
      t.id === trabajadorEditar.id
        ? { ...t, nombre: formEditar.nombre, cargo: formEditar.cargo, email: formEditar.email, telefono: formEditar.telefono, tecnologias: techs }
        : t
    ));
    setModalEditar(false);
    setTrabajadorEditar(null);
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const abrirEliminar = (t: Trabajador) => {
    setTrabajadorEliminar(t);
    setModalEliminar(true);
  };

  const confirmarEliminar = () => {
    if (!trabajadorEliminar) return;
    setTrabajadores(trabajadores.filter(t => t.id !== trabajadorEliminar.id));
    setModalEliminar(false);
    setTrabajadorEliminar(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Equipo de Trabajo</h2>
          <p className="text-slate-600 mt-1">Gestión de trabajadores y sus tecnologías</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={abrirCrear}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Trabajador
        </Button>
      </div>

      {/* Modal Crear */}
      <Dialog open={modalCrear} onOpenChange={(open) => { setModalCrear(open); if (!open) setFormCrear(FORM_VACÍO); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Trabajador</DialogTitle>
            <DialogDescription>Ingrese los datos del nuevo integrante del equipo.</DialogDescription>
          </DialogHeader>
          <FormularioTrabajador
            form={formCrear}
            setForm={setFormCrear}
            onSubmit={guardarCrear}
            onCancel={() => { setModalCrear(false); setFormCrear(FORM_VACÍO); }}
            esEdicion={false}
            cargosActivos={cargosActivos}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) setTrabajadorEditar(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Trabajador</DialogTitle>
            <DialogDescription>
              Modificando datos de <strong>{trabajadorEditar?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>
          <FormularioTrabajador
            form={formEditar}
            setForm={setFormEditar}
            onSubmit={guardarEditar}
            onCancel={() => { setModalEditar(false); setTrabajadorEditar(null); }}
            esEdicion={true}
            cargosActivos={cargosActivos}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminar */}
      <Dialog open={modalEliminar} onOpenChange={(open) => { setModalEliminar(open); if (!open) setTrabajadorEliminar(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong className="text-slate-800">{trabajadorEliminar?.nombre}</strong>?{' '}
              <span className="text-red-600">Esta acción no se puede deshacer.</span>
            </DialogDescription>
          </DialogHeader>
          {trabajadorEliminar && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm text-slate-600 border border-slate-200">
              <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /><span>{trabajadorEliminar.cargo}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span>{trabajadorEliminar.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{trabajadorEliminar.telefono}</span></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setModalEliminar(false); setTrabajadorEliminar(null); }}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmarEliminar}>
              <Trash2 className="h-4 w-4 mr-2" />Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Trabajadores</p>
                <p className="text-3xl text-slate-800 mt-2">{trabajadores.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tecnologías Únicas</p>
                <p className="text-3xl text-slate-800 mt-2">
                  {new Set(trabajadores.flatMap(t => t.tecnologias)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <Code className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Roles Diferentes</p>
                <p className="text-3xl text-slate-800 mt-2">
                  {new Set(trabajadores.map(t => t.cargo)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader><CardTitle>Listado de Trabajadores</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tecnologías</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trabajadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No hay trabajadores registrados
                  </TableCell>
                </TableRow>
              ) : (
                trabajadores.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-700 font-medium text-sm">
                            {t.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-800 font-medium">{t.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{t.cargo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600">{t.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600">{t.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {t.tecnologias.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.tecnologias.map((tech, i) => (
                            <Badge key={i} className="bg-cyan-100 text-cyan-700 text-xs">{tech}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No aplica</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(t)} title="Editar">
                          <Edit className="h-4 w-4 text-cyan-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => abrirEliminar(t)} title="Eliminar">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribución por cargo */}
      <Card>
        <CardHeader><CardTitle>Distribución por Cargo</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cargosActivos.map((cargo) => {
              const count = trabajadores.filter(t => t.cargo === cargo.nombre).length;
              return (
                <div key={cargo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">{cargo.nombre}</span>
                  <Badge variant="outline">{count} {count === 1 ? 'persona' : 'personas'}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
