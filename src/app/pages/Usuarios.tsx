import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Usuario } from "../context/AppContext";
import { UserCog, Plus, Edit, Trash2, Search, Mail, Briefcase, Eye, EyeOff, KeyRound, Cloud, HardDrive, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { dbConfigured } from "../services/db";

const ROLES = ['Administrador', 'Supervisor', 'Operador'];
const ROL_COLORS: Record<string, string> = {
  Administrador: 'bg-cyan-100 text-cyan-700',
  Supervisor:    'bg-sky-100 text-sky-700',
  Operador:      'bg-slate-100 text-slate-700',
};
type FormData = { nombre:string; cargo:string; email:string; rol:string; password:string; passwordConfirm:string; };
const emptyForm = (): FormData => ({ nombre:'', cargo:'', email:'', rol:'Operador', password:'', passwordConfirm:'' });

export function Usuarios() {
  const { usuarios, setUsuarios, cargosActivos } = useApp();
  const [searchTerm,         setSearchTerm]         = useState('');
  const [isDialogOpen,       setIsDialogOpen]       = useState(false);
  const [editingUsuario,     setEditingUsuario]     = useState<Usuario | null>(null);
  const [formData,           setFormData]           = useState<FormData>(emptyForm());
  const [showPassword,       setShowPassword]       = useState(false);
  const [showConfirm,        setShowConfirm]        = useState(false);
  const [pwdError,           setPwdError]           = useState('');
  const [saving,             setSaving]             = useState(false);
  const [deleteDialog,       setDeleteDialog]       = useState(false);
  const [usuarioAEliminar,   setUsuarioAEliminar]   = useState<Usuario | null>(null);

  const esNube = dbConfigured();

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (!editingUsuario || formData.password) {
      if (formData.password.length < 6) { setPwdError('Mínimo 6 caracteres.'); return; }
      if (formData.password !== formData.passwordConfirm) { setPwdError('Las contraseñas no coinciden.'); return; }
    }
    setSaving(true);
    try {
      if (editingUsuario) {
        const updated = usuarios.map(u => u.id === editingUsuario.id ? {
          ...u,
          nombre: formData.nombre, cargo: formData.cargo,
          email: formData.email, rol: formData.rol,
          ...(formData.password ? { password: formData.password } : {}),
        } : u);
        await setUsuarios(updated);
      } else {
        const newU: Usuario = {
          id: Math.max(0, ...usuarios.map(u => u.id)) + 1,
          nombre: formData.nombre, cargo: formData.cargo,
          email: formData.email, rol: formData.rol,
          password: formData.password,
        };
        await setUsuarios([...usuarios, newU]);
      }
      resetForm();
      setIsDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u: Usuario) => {
    setEditingUsuario(u);
    setFormData({ nombre:u.nombre, cargo:u.cargo, email:u.email, rol:u.rol, password:'', passwordConfirm:'' });
    setPwdError('');
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (u: Usuario) => { setUsuarioAEliminar(u); setDeleteDialog(true); };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setSaving(true);
    try {
      await setUsuarios(usuarios.filter(u => u.id !== usuarioAEliminar.id));
    } finally {
      setSaving(false);
      setDeleteDialog(false);
      setUsuarioAEliminar(null);
    }
  };

  const resetForm = () => { setFormData(emptyForm()); setEditingUsuario(null); setPwdError(''); setShowPassword(false); setShowConfirm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Usuarios</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-600">Usuarios con acceso al sistema</p>
            {esNube
              ? <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><Cloud className="h-3 w-3" />Nube</Badge>
              : <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1"><HardDrive className="h-3 w-3" />Local</Badge>
            }
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Nuevo Usuario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
              <DialogDescription>
                {editingUsuario ? 'Deja la contraseña vacía para mantener la actual.' : 'Completa todos los campos para crear el acceso.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre:e.target.value})} placeholder="Ej: Juan Pérez" required />
              </div>
              <div>
                <Label>Correo Electrónico</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})} placeholder="usuario@devstream.cl" required />
              </div>
              <div>
                <Label>Cargo</Label>
                <Select value={formData.cargo} onValueChange={v => setFormData({...formData, cargo:v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{cargosActivos.map(c => <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rol en el Sistema</Label>
                <Select value={formData.rol} onValueChange={v => setFormData({...formData, rol:v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t">
                <KeyRound className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium text-slate-700">{editingUsuario ? 'Cambiar contraseña (opcional)' : 'Contraseña de acceso'}</span>
              </div>
              {(['password','passwordConfirm'] as const).map((campo, i) => {
                const show = i === 0 ? showPassword : showConfirm;
                const setShow = i === 0 ? setShowPassword : setShowConfirm;
                return (
                  <div key={campo}>
                    <Label>{i === 0 ? (editingUsuario ? 'Nueva Contraseña' : 'Contraseña') : 'Confirmar Contraseña'}</Label>
                    <div className="relative">
                      <Input
                        type={show ? 'text' : 'password'}
                        value={formData[campo]}
                        onChange={e => setFormData({...formData, [campo]:e.target.value})}
                        placeholder={i === 0 ? (editingUsuario ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres') : 'Repetir contraseña'}
                        required={!editingUsuario || !!formData.password}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" tabIndex={-1}>
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {pwdError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{pwdError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={saving}>
                  {saving ? 'Guardando...' : editingUsuario ? 'Actualizar' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aviso modo local */}
      {!esNube && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Modo Local — los usuarios solo existen en este navegador</p>
            <p className="text-xs text-amber-700 mt-1">
              Para compartir usuarios entre navegadores, configura <code className="bg-amber-100 px-1 rounded">VITE_GIST_ID</code> y <code className="bg-amber-100 px-1 rounded">VITE_GITHUB_TOKEN</code> en Cloudflare Pages → Settings → Environment Variables.
            </p>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total</p><p className="text-2xl text-slate-800">{usuarios.length}</p></CardContent></Card>
        {ROLES.map(rol => (
          <Card key={rol}><CardContent className="p-4">
            <p className="text-sm text-slate-500">{rol}es</p>
            <p className={`text-2xl ${rol==='Administrador'?'text-cyan-600':rol==='Supervisor'?'text-sky-600':'text-slate-600'}`}>
              {usuarios.filter(u=>u.rol===rol).length}
            </p>
          </CardContent></Card>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">Sin resultados</TableCell></TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-xs font-semibold flex-shrink-0">
                        {u.nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400 flex-shrink-0" /><span className="text-sm">{u.email}</span></div></TableCell>
                  <TableCell><div className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-700">{u.cargo}</span></div></TableCell>
                  <TableCell><Badge className={ROL_COLORS[u.rol] ?? 'bg-slate-100 text-slate-700'}>{u.rol}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}><Edit className="h-4 w-4 text-cyan-600" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(u)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm delete */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>¿Eliminar a <strong>{usuarioAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarEliminar} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
