import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Cargo } from '../context/AppContext';
import { Briefcase, Plus, Edit, Trash2, Search, Tag, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const categorias = ['Desarrollo', 'Análisis', 'Gestión', 'Calidad', 'Infraestructura', 'Diseño', 'Otro'];

const categoriaColors: Record<string, string> = {
  'Desarrollo': 'bg-cyan-100 text-cyan-700',
  'Análisis': 'bg-sky-100 text-sky-700',
  'Gestión': 'bg-blue-100 text-blue-700',
  'Calidad': 'bg-green-100 text-green-700',
  'Infraestructura': 'bg-purple-100 text-purple-700',
  'Diseño': 'bg-pink-100 text-pink-700',
  'Otro': 'bg-slate-100 text-slate-700',
};

export function Cargos() {
  const { cargos, setCargos } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Desarrollo',
    activo: true,
  });

  const filtered = cargos.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivos = cargos.filter(c => c.activo).length;
  const totalInactivos = cargos.filter(c => !c.activo).length;
  const totalCategorias = new Set(cargos.map(c => c.categoria)).size;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCargo) {
      setCargos(cargos.map(c => c.id === editingCargo.id ? { ...formData, id: editingCargo.id } : c));
    } else {
      const newId = cargos.length > 0 ? Math.max(...cargos.map(c => c.id)) + 1 : 1;
      setCargos([...cargos, { ...formData, id: newId }]);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({ nombre: cargo.nombre, descripcion: cargo.descripcion, categoria: cargo.categoria, activo: cargo.activo });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Deseas eliminar este cargo?')) {
      setCargos(cargos.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', categoria: 'Desarrollo', activo: true });
    setEditingCargo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Cargos</h2>
          <p className="text-slate-600 mt-1">Administración de puestos y posiciones del equipo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCargo ? 'Editar Cargo' : 'Registrar Nuevo Cargo'}</DialogTitle>
              <DialogDescription>
                {editingCargo ? 'Modifique los datos del cargo.' : 'Complete la información del nuevo cargo.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nombre-cargo">Nombre del Cargo</Label>
                <Input
                  id="nombre-cargo"
                  placeholder="Ej: Desarrollador Fullstack"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion-cargo">Descripción</Label>
                <Input
                  id="descripcion-cargo"
                  placeholder="Descripción breve del cargo y sus responsabilidades"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria-cargo">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger id="categoria-cargo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo-cargo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600"
                />
                <Label htmlFor="activo-cargo">Cargo activo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingCargo ? 'Actualizar' : 'Registrar Cargo'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Cargos</p>
                <p className="text-3xl text-slate-800 mt-1">{cargos.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cargos Activos</p>
                <p className="text-3xl text-green-600 mt-1">{totalActivos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cargos Inactivos</p>
                <p className="text-3xl text-slate-500 mt-1">{totalInactivos}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Categorías</p>
                <p className="text-3xl text-blue-600 mt-1">{totalCategorias}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Cargos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cargos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre del Cargo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">No se encontraron cargos</TableCell>
                </TableRow>
              ) : (
                filtered.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell className="font-medium">#{cargo.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{cargo.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{cargo.descripcion}</TableCell>
                    <TableCell>
                      <Badge className={categoriaColors[cargo.categoria] || 'bg-slate-100 text-slate-700'}>
                        {cargo.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cargo.activo
                        ? <Badge className="bg-green-100 text-green-700">Activo</Badge>
                        : <Badge className="bg-slate-100 text-slate-500">Inactivo</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cargo)}>
                          <Edit className="h-4 w-4 text-cyan-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cargo.id)}>
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

      {/* Distribución por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categorias.map(cat => {
              const count = cargos.filter(c => c.categoria === cat).length;
              if (count === 0) return null;
              return (
                <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Badge className={categoriaColors[cat] || 'bg-slate-100 text-slate-700'}>{cat}</Badge>
                  <span className="text-sm text-slate-600">{count} {count === 1 ? 'cargo' : 'cargos'}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
