import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';



export function Roles() {
  const { roles, setRoles } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: {
      crear: false,
      editar: false,
      eliminar: false,
      ver: false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const permisosArray = [];
    if (formData.permisos.crear) permisosArray.push('Crear');
    if (formData.permisos.editar) permisosArray.push('Editar');
    if (formData.permisos.eliminar) permisosArray.push('Eliminar');
    if (formData.permisos.ver) permisosArray.push('Ver');

    const nuevoRol = {
      id: roles.length + 1,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      permisos: permisosArray,
      usuarios: 0,
      activo: true
    };

    await setRoles([...roles, nuevoRol]);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      permisos: { crear: false, editar: false, eliminar: false, ver: false }
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    await setRoles(roles.filter(r => r.id !== id));
  };

  const toggleActivo = async (id: number) => {
    await setRoles(roles.map(r => r.id === id ? { ...r, activo: !r.activo } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Roles</h2>
          <p className="text-slate-600 mt-1">Administrar roles y permisos del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
              <DialogDescription>Defina el nombre, descripción y permisos del rol.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Rol</Label>
                <Input 
                  id="nombre" 
                  placeholder="Ej: Supervisor, Coordinador, etc."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input 
                  id="descripcion" 
                  placeholder="Breve descripción del rol"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permisos</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.permisos.crear}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        permisos: { ...formData.permisos, crear: e.target.checked }
                      })}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="text-slate-700">Crear</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.permisos.editar}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        permisos: { ...formData.permisos, editar: e.target.checked }
                      })}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="text-slate-700">Editar</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.permisos.eliminar}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        permisos: { ...formData.permisos, eliminar: e.target.checked }
                      })}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="text-slate-700">Eliminar</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.permisos.ver}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        permisos: { ...formData.permisos, ver: e.target.checked }
                      })}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="text-slate-700">Ver</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                Crear Rol
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Roles</p>
                <p className="text-3xl text-slate-800 mt-2">{roles.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Roles Activos</p>
                <p className="text-3xl text-slate-800 mt-2">
                  {roles.filter(r => r.activo).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Usuarios</p>
                <p className="text-3xl text-slate-800 mt-2">
                  {roles.reduce((sum, r) => sum + r.usuarios, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Roles Inactivos</p>
                <p className="text-3xl text-slate-800 mt-2">
                  {roles.filter(r => !r.activo).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((rol) => (
                <TableRow key={rol.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-cyan-600" />
                      </div>
                      <span className="text-slate-800">{rol.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-sm">{rol.descripcion}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rol.permisos.map((permiso, index) => (
                        <Badge 
                          key={index} 
                          className="bg-sky-100 text-sky-700 text-xs"
                        >
                          {permiso}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-700">
                      {rol.usuarios} {rol.usuarios === 1 ? 'usuario' : 'usuarios'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActivo(rol.id)}
                      className="cursor-pointer"
                    >
                      <Badge className={rol.activo ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'}>
                        {rol.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(rol.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Usuarios por Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.filter(r => r.activo).map((rol) => {
                const totalUsuarios = roles.reduce((sum, r) => sum + r.usuarios, 0);
                const porcentaje = totalUsuarios > 0 ? Math.round((rol.usuarios / totalUsuarios) * 100) : 0;
                return (
                  <div key={rol.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-sm">{rol.nombre}</span>
                      <span className="text-slate-500 text-sm">{rol.usuarios} usuarios ({porcentaje}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all" 
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Crear', 'Editar', 'Eliminar', 'Ver'].map((permiso) => {
                const count = roles.filter(r => r.activo && r.permisos.includes(permiso)).length;
                return (
                  <div key={permiso} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{permiso}</span>
                    <Badge variant="outline">{count} {count === 1 ? 'rol' : 'roles'}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
