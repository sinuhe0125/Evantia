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
  'Desarrollo': 'bg-cyan-100 text-cyan-700', 'Análisis': 'bg-sky-100 text-sky-700',
  'Gestión': 'bg-blue-100 text-blue-700', 'Calidad': 'bg-green-100 text-green-700',
  'Infraestructura': 'bg-purple-100 text-purple-700', 'Diseño': 'bg-pink-100 text-pink-700',
  'Otro': 'bg-slate-100 text-slate-700',
};

export function Cargos() {
  const { cargos, setCargos } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ nombre:'', descripcion:'', categoria:'Desarrollo', activo:true });

  const filtered = cargos.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCargo) {
        await setCargos(cargos.map(c => c.id === editingCargo.id ? { ...formData, id: editingCargo.id } : c));
      } else {
        const newId = cargos.length > 0 ? Math.max(...cargos.map(c => c.id)) + 1 : 1;
        await setCargos([...cargos, { ...formData, id: newId }]);
      }
      resetForm();
      setIsDialogOpen(false);
    } finally { setSaving(false); }
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({ nombre: cargo.nombre, descripcion: cargo.descripcion, categoria: cargo.categoria, activo: cargo.activo });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Deseas eliminar este cargo?')) return;
    await setCargos(cargos.filter(c => c.id !== id));
  };

  const resetForm = () => { setFormData({ nombre:'', descripcion:'', categoria:'Desarrollo', activo:true }); setEditingCargo(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Gestión de Cargos</h2>
          <p className="text-slate-600 mt-1">Administración de puestos y posiciones del equipo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Nuevo Cargo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCargo ? 'Editar Cargo' : 'Registrar Nuevo Cargo'}</DialogTitle>
              <DialogDescription>{editingCargo ? 'Modifique los datos del cargo.' : 'Complete la información del nuevo cargo.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nombre del Cargo</Label>
                <Input placeholder="Ej: Desarrollador Fullstack" value={formData.nombre} onChange={e => setFormData({...formData, nombre:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input placeholder="Descripción breve del cargo" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={formData.categoria} onValueChange={v => setFormData({...formData, categoria:v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({...formData, activo:e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-cyan-600" />
                <Label htmlFor="activo">Cargo activo</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={saving}>{saving ? 'Guardando...' : editingCargo ? 'Actualizar' : 'Registrar Cargo'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label:'Total Cargos',     value:cargos.length,                          color:'text-slate-800', bg:'bg-cyan-100',  icon:<Briefcase className="h-6 w-6 text-cyan-600" /> },
          { label:'Cargos Activos',   value:cargos.filter(c=>c.activo).length,      color:'text-green-600', bg:'bg-green-100', icon:<Users className="h-6 w-6 text-green-600" /> },
          { label:'Cargos Inactivos', value:cargos.filter(c=>!c.activo).length,     color:'text-slate-500', bg:'bg-slate-100', icon:<Briefcase className="h-6 w-6 text-slate-500" /> },
          { label:'Categorías',       value:new Set(cargos.map(c=>c.categoria)).size,color:'text-blue-600',  bg:'bg-blue-100',  icon:<Tag className="h-6 w-6 text-blue-600" /> },
        ].map(m => (
          <Card key={m.label}><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-600">{m.label}</p><p className={`text-3xl mt-1 ${m.color}`}>{m.value}</p></div>
              <div className={`w-12 h-12 ${m.bg} rounded-lg flex items-center justify-center`}>{m.icon}</div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Cargos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar cargos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0
                ? <TableRow><TableCell colSpan={6} className="text-center text-slate-500">No se encontraron cargos</TableCell></TableRow>
                : filtered.map(cargo => (
                  <TableRow key={cargo.id}>
                    <TableCell className="font-medium">#{cargo.id}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /><span className="font-medium text-slate-800">{cargo.nombre}</span></div></TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{cargo.descripcion}</TableCell>
                    <TableCell><Badge className={categoriaColors[cargo.categoria] || 'bg-slate-100 text-slate-700'}>{cargo.categoria}</Badge></TableCell>
                    <TableCell>{cargo.activo ? <Badge className="bg-green-100 text-green-700">Activo</Badge> : <Badge className="bg-slate-100 text-slate-500">Inactivo</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cargo)}><Edit className="h-4 w-4 text-cyan-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cargo.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
