import { useState, useMemo } from 'react';
import { Search, Plus, Download, FileText, TrendingUp, Award, Calendar, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Criterio {
  nombre: string;
  peso: number;
  calificacion: number;
}

interface Evaluacion {
  id: string;
  colaborador: string;
  puesto: string;
  rol: string;
  proyecto: string;
  periodo: string;
  mes: string;
  evaluador: string;
  criterios: Criterio[];
  fortalezas: string;
  areasMejora: string;
  acciones: string;
  capacitacion: string;
  fecha: string;
}

const criteriosBase: Criterio[] = [
  { nombre: 'Cumplimiento de Proyectos', peso: 0.3, calificacion: 3 },
  { nombre: 'Calidad del Trabajo', peso: 0.3, calificacion: 3 },
  { nombre: 'Actitud y Trabajo en Equipo', peso: 0.2, calificacion: 4 },
  { nombre: 'Cumplimiento de Procesos', peso: 0.1, calificacion: 4 },
  { nombre: 'Cumplimiento de Expectativas', peso: 0.1, calificacion: 3 },
];

const evaluacionesMock: Evaluacion[] = [
  {
    id: '1',
    colaborador: 'Carlos Mendoza',
    puesto: 'Desarrollador Full Stack',
    rol: 'Desarrollador',
    proyecto: 'Sistema de Gestión ERP',
    periodo: 'Marzo 2026',
    mes: '2026-03',
    evaluador: 'Ana Torres',
    criterios: [
      { nombre: 'Cumplimiento de Proyectos', peso: 0.3, calificacion: 4 },
      { nombre: 'Calidad del Trabajo', peso: 0.3, calificacion: 4 },
      { nombre: 'Actitud y Trabajo en Equipo', peso: 0.2, calificacion: 5 },
      { nombre: 'Cumplimiento de Procesos', peso: 0.1, calificacion: 4 },
      { nombre: 'Cumplimiento de Expectativas', peso: 0.1, calificacion: 4 },
    ],
    fortalezas: 'Excelente trabajo en equipo, proactividad',
    areasMejora: 'Mejorar documentación de código',
    acciones: 'Implementar mejores prácticas de documentación',
    capacitacion: 'Clean Code, Documentación técnica',
    fecha: '2026-03-15',
  },
  {
    id: '2',
    colaborador: 'Laura Ramírez',
    puesto: 'Desarrolladora Frontend',
    rol: 'Desarrollador',
    proyecto: 'App Móvil Bancaria',
    periodo: 'Marzo 2026',
    mes: '2026-03',
    evaluador: 'Ana Torres',
    criterios: [
      { nombre: 'Cumplimiento de Proyectos', peso: 0.3, calificacion: 5 },
      { nombre: 'Calidad del Trabajo', peso: 0.3, calificacion: 5 },
      { nombre: 'Actitud y Trabajo en Equipo', peso: 0.2, calificacion: 4 },
      { nombre: 'Cumplimiento de Procesos', peso: 0.1, calificacion: 5 },
      { nombre: 'Cumplimiento de Expectativas', peso: 0.1, calificacion: 5 },
    ],
    fortalezas: 'Alto nivel técnico, cumplimiento de plazos',
    areasMejora: 'Mayor comunicación con el equipo',
    acciones: 'Participar en daily standups activamente',
    capacitacion: 'Soft Skills, Comunicación efectiva',
    fecha: '2026-03-20',
  },
  {
    id: '3',
    colaborador: 'Carlos Mendoza',
    puesto: 'Desarrollador Full Stack',
    rol: 'Desarrollador',
    proyecto: 'Plataforma E-commerce',
    periodo: 'Febrero 2026',
    mes: '2026-02',
    evaluador: 'Ana Torres',
    criterios: [
      { nombre: 'Cumplimiento de Proyectos', peso: 0.3, calificacion: 3 },
      { nombre: 'Calidad del Trabajo', peso: 0.3, calificacion: 4 },
      { nombre: 'Actitud y Trabajo en Equipo', peso: 0.2, calificacion: 4 },
      { nombre: 'Cumplimiento de Procesos', peso: 0.1, calificacion: 3 },
      { nombre: 'Cumplimiento de Expectativas', peso: 0.1, calificacion: 4 },
    ],
    fortalezas: 'Buena resolución de problemas',
    areasMejora: 'Mejorar estimaciones de tiempo',
    acciones: 'Usar técnicas de estimación ágil',
    capacitacion: 'Scrum, Estimación ágil',
    fecha: '2026-02-28',
  },
  {
    id: '4',
    colaborador: 'Diego Silva',
    puesto: 'Desarrollador Backend',
    rol: 'Desarrollador',
    proyecto: 'Sistema de Gestión ERP',
    periodo: 'Marzo 2026',
    mes: '2026-03',
    evaluador: 'Roberto Gómez',
    criterios: [
      { nombre: 'Cumplimiento de Proyectos', peso: 0.3, calificacion: 4 },
      { nombre: 'Calidad del Trabajo', peso: 0.3, calificacion: 5 },
      { nombre: 'Actitud y Trabajo en Equipo', peso: 0.2, calificacion: 3 },
      { nombre: 'Cumplimiento de Procesos', peso: 0.1, calificacion: 4 },
      { nombre: 'Cumplimiento de Expectativas', peso: 0.1, calificacion: 4 },
    ],
    fortalezas: 'Excelente conocimiento técnico, código limpio',
    areasMejora: 'Colaboración con otros desarrolladores',
    acciones: 'Pair programming semanal',
    capacitacion: 'Trabajo en equipo',
    fecha: '2026-03-18',
  },
];

const calcularTotal = (criterios: Criterio[]): number => {
  return criterios.reduce((total, c) => total + c.peso * c.calificacion, 0);
};

const getClasificacion = (total: number): { label: string; color: string } => {
  if (total >= 4.5) return { label: 'Excelente', color: 'bg-green-100 text-green-700' };
  if (total >= 3.5) return { label: 'Bueno', color: 'bg-blue-100 text-blue-700' };
  if (total >= 2.5) return { label: 'Aceptable', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Requiere Mejora', color: 'bg-red-100 text-red-700' };
};

export function Evaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(evaluacionesMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verDetalle, setVerDetalle] = useState<Evaluacion | null>(null);

  const [nuevaEvaluacion, setNuevaEvaluacion] = useState<Partial<Evaluacion>>({
    colaborador: '',
    puesto: '',
    rol: 'Desarrollador',
    proyecto: '',
    periodo: '',
    mes: '',
    evaluador: '',
    criterios: [...criteriosBase],
    fortalezas: '',
    areasMejora: '',
    acciones: '',
    capacitacion: '',
  });

  const meses = useMemo(() => {
    const mesesSet = new Set(evaluaciones.map(e => e.mes));
    return Array.from(mesesSet).sort().reverse();
  }, [evaluaciones]);

  const evaluacionesFiltradas = useMemo(() => {
    return evaluaciones.filter(evaluacion => {
      const matchSearch = evaluacion.colaborador.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMes = filtroMes === 'todos' || evaluacion.mes === filtroMes;
      const matchRol = filtroRol === 'todos' || evaluacion.rol === filtroRol;
      return matchSearch && matchMes && matchRol;
    });
  }, [evaluaciones, searchTerm, filtroMes, filtroRol]);

  const promediosPorColaboradorMes = useMemo(() => {
    const promedios: { [key: string]: { total: number; count: number; nombre: string; mes: string } } = {};

    evaluacionesFiltradas.forEach(evaluacion => {
      const key = `${evaluacion.colaborador}-${evaluacion.mes}`;
      const total = calcularTotal(evaluacion.criterios);

      if (!promedios[key]) {
        promedios[key] = { total: 0, count: 0, nombre: evaluacion.colaborador, mes: evaluacion.mes };
      }
      promedios[key].total += total;
      promedios[key].count += 1;
    });

    return Object.entries(promedios).map(([key, data]) => ({
      key,
      nombre: data.nombre,
      mes: data.mes,
      promedio: data.total / data.count,
      cantidadEvaluaciones: data.count,
    }));
  }, [evaluacionesFiltradas]);

  const handleAgregarEvaluacion = () => {
    if (!nuevaEvaluacion.colaborador || !nuevaEvaluacion.periodo || !nuevaEvaluacion.mes) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const evaluacion: Evaluacion = {
      id: Date.now().toString(),
      colaborador: nuevaEvaluacion.colaborador!,
      puesto: nuevaEvaluacion.puesto!,
      rol: nuevaEvaluacion.rol!,
      proyecto: nuevaEvaluacion.proyecto!,
      periodo: nuevaEvaluacion.periodo!,
      mes: nuevaEvaluacion.mes!,
      evaluador: nuevaEvaluacion.evaluador!,
      criterios: nuevaEvaluacion.criterios!,
      fortalezas: nuevaEvaluacion.fortalezas!,
      areasMejora: nuevaEvaluacion.areasMejora!,
      acciones: nuevaEvaluacion.acciones!,
      capacitacion: nuevaEvaluacion.capacitacion!,
      fecha: new Date().toISOString().split('T')[0],
    };

    setEvaluaciones([...evaluaciones, evaluacion]);
    setDialogOpen(false);
    setNuevaEvaluacion({
      colaborador: '',
      puesto: '',
      rol: 'Desarrollador',
      proyecto: '',
      periodo: '',
      mes: '',
      evaluador: '',
      criterios: [...criteriosBase],
      fortalezas: '',
      areasMejora: '',
      acciones: '',
      capacitacion: '',
    });
  };

  const updateCriterio = (index: number, calificacion: number) => {
    const criterios = [...(nuevaEvaluacion.criterios || criteriosBase)];
    criterios[index].calificacion = calificacion;
    setNuevaEvaluacion({ ...nuevaEvaluacion, criterios });
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Evaluaciones de Desempeño', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total de evaluaciones: ${evaluacionesFiltradas.length}`, 14, 34);

    // Tabla de Promedios por Colaborador y Mes
    if (promediosPorColaboradorMes.length > 0) {
      doc.setFontSize(14);
      doc.text('Promedios por Colaborador y Mes', 14, 44);

      const promediosData = promediosPorColaboradorMes.map(p => [
        p.nombre,
        p.mes,
        p.cantidadEvaluaciones.toString(),
        p.promedio.toFixed(2),
        getClasificacion(p.promedio).label
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Colaborador', 'Mes', 'Cantidad', 'Promedio', 'Clasificación']],
        body: promediosData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });
    }

    // Tabla de Evaluaciones Individuales
    const startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 90;

    doc.setFontSize(14);
    doc.text('Evaluaciones Individuales', 14, startY);

    const tableData = evaluacionesFiltradas.map(evaluacion => [
      evaluacion.colaborador,
      evaluacion.puesto,
      evaluacion.proyecto,
      evaluacion.periodo,
      calcularTotal(evaluacion.criterios).toFixed(2),
      getClasificacion(calcularTotal(evaluacion.criterios)).label
    ]);

    autoTable(doc, {
      startY: startY + 4,
      head: [['Colaborador', 'Puesto', 'Proyecto', 'Período', 'Calificación', 'Clasificación']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    doc.save('evaluaciones-desempeno.pdf');
  };

  const exportarExcel = () => {
    // Hoja 1: Promedios por Colaborador y Mes
    const promediosData = promediosPorColaboradorMes.map(p => ({
      'Colaborador': p.nombre,
      'Mes': p.mes,
      'Cantidad Evaluaciones': p.cantidadEvaluaciones,
      'Promedio': parseFloat(p.promedio.toFixed(2)),
      'Clasificación': getClasificacion(p.promedio).label
    }));

    // Hoja 2: Evaluaciones Individuales
    const evaluacionesData = evaluacionesFiltradas.map(evaluacion => ({
      'Colaborador': evaluacion.colaborador,
      'Puesto': evaluacion.puesto,
      'Rol': evaluacion.rol,
      'Proyecto': evaluacion.proyecto,
      'Período': evaluacion.periodo,
      'Mes': evaluacion.mes,
      'Evaluador': evaluacion.evaluador,
      'Calificación': parseFloat(calcularTotal(evaluacion.criterios).toFixed(2)),
      'Clasificación': getClasificacion(calcularTotal(evaluacion.criterios)).label,
      'Fortalezas': evaluacion.fortalezas,
      'Áreas de Mejora': evaluacion.areasMejora,
      'Acciones': evaluacion.acciones,
      'Capacitación': evaluacion.capacitacion,
      'Fecha': evaluacion.fecha
    }));

    // Hoja 3: Detalle de Criterios
    const criteriosData: any[] = [];
    evaluacionesFiltradas.forEach(evaluacion => {
      evaluacion.criterios.forEach(criterio => {
        criteriosData.push({
          'Colaborador': evaluacion.colaborador,
          'Período': evaluacion.periodo,
          'Criterio': criterio.nombre,
          'Peso': criterio.peso,
          'Calificación': criterio.calificacion,
          'Puntaje Ponderado': parseFloat((criterio.peso * criterio.calificacion).toFixed(2))
        });
      });
    });

    const wb = XLSX.utils.book_new();

    const wsPromedios = XLSX.utils.json_to_sheet(promediosData);
    const wsEvaluaciones = XLSX.utils.json_to_sheet(evaluacionesData);
    const wsCriterios = XLSX.utils.json_to_sheet(criteriosData);

    XLSX.utils.book_append_sheet(wb, wsPromedios, 'Promedios');
    XLSX.utils.book_append_sheet(wb, wsEvaluaciones, 'Evaluaciones');
    XLSX.utils.book_append_sheet(wb, wsCriterios, 'Detalle Criterios');

    XLSX.writeFile(wb, 'evaluaciones-desempeno.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Evaluaciones de Desempeño</h2>
          <p className="text-slate-600 mt-1">Gestiona y consulta evaluaciones de desarrolladores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación de Desempeño</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información General */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-4">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Colaborador *</Label>
                    <Input
                      value={nuevaEvaluacion.colaborador}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, colaborador: e.target.value })}
                      placeholder="Ej: Carlos Mendoza"
                    />
                  </div>
                  <div>
                    <Label>Puesto</Label>
                    <Input
                      value={nuevaEvaluacion.puesto}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, puesto: e.target.value })}
                      placeholder="Ej: Desarrollador Full Stack"
                    />
                  </div>
                  <div>
                    <Label>Rol *</Label>
                    <Select
                      value={nuevaEvaluacion.rol}
                      onValueChange={(value) => setNuevaEvaluacion({ ...nuevaEvaluacion, rol: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Desarrollador">Desarrollador</SelectItem>
                        <SelectItem value="Project Manager">Project Manager</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Proyecto</Label>
                    <Input
                      value={nuevaEvaluacion.proyecto}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, proyecto: e.target.value })}
                      placeholder="Ej: Sistema de Gestión ERP"
                    />
                  </div>
                  <div>
                    <Label>Período de Evaluación *</Label>
                    <Input
                      value={nuevaEvaluacion.periodo}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, periodo: e.target.value })}
                      placeholder="Ej: Marzo 2026"
                    />
                  </div>
                  <div>
                    <Label>Mes (YYYY-MM) *</Label>
                    <Input
                      value={nuevaEvaluacion.mes}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, mes: e.target.value })}
                      placeholder="Ej: 2026-03"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Evaluador</Label>
                    <Input
                      value={nuevaEvaluacion.evaluador}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, evaluador: e.target.value })}
                      placeholder="Ej: Ana Torres"
                    />
                  </div>
                </div>
              </div>

              {/* Criterios */}
              <div>
                <h3 className="font-medium text-slate-900 mb-4">Criterios de Evaluación</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 text-sm text-slate-700">Criterio</th>
                        <th className="text-center p-3 text-sm text-slate-700">Peso</th>
                        <th className="text-center p-3 text-sm text-slate-700">Calificación (1-5)</th>
                        <th className="text-center p-3 text-sm text-slate-700">Puntaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(nuevaEvaluacion.criterios || criteriosBase).map((criterio, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{criterio.nombre}</td>
                          <td className="p-3 text-sm text-center">{(criterio.peso * 100).toFixed(0)}%</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={criterio.calificacion}
                              onChange={(e) => updateCriterio(index, parseInt(e.target.value) || 1)}
                              className="text-center"
                            />
                          </td>
                          <td className="p-3 text-sm text-center font-medium">
                            {(criterio.peso * criterio.calificacion).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50 font-bold">
                        <td colSpan={3} className="p-3 text-right">Total:</td>
                        <td className="p-3 text-center text-blue-600">
                          {calcularTotal(nuevaEvaluacion.criterios || criteriosBase).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Plan de Mejora */}
              <div>
                <h3 className="font-medium text-slate-900 mb-4">Plan de Mejora</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Fortalezas Identificadas</Label>
                    <Input
                      value={nuevaEvaluacion.fortalezas}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, fortalezas: e.target.value })}
                      placeholder="Ej: Excelente trabajo en equipo, proactividad"
                    />
                  </div>
                  <div>
                    <Label>Áreas de Mejora</Label>
                    <Input
                      value={nuevaEvaluacion.areasMejora}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, areasMejora: e.target.value })}
                      placeholder="Ej: Mejorar documentación de código"
                    />
                  </div>
                  <div>
                    <Label>Acciones Recomendadas</Label>
                    <Input
                      value={nuevaEvaluacion.acciones}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, acciones: e.target.value })}
                      placeholder="Ej: Implementar mejores prácticas de documentación"
                    />
                  </div>
                  <div>
                    <Label>Capacitación Sugerida</Label>
                    <Input
                      value={nuevaEvaluacion.capacitacion}
                      onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, capacitacion: e.target.value })}
                      placeholder="Ej: Clean Code, Documentación técnica"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAgregarEvaluacion} className="bg-blue-600 hover:bg-blue-700">
                  Guardar Evaluación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Evaluaciones</p>
                <p className="text-2xl text-slate-900 mt-1">{evaluaciones.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Promedio General</p>
                <p className="text-2xl text-slate-900 mt-1">
                  {(evaluaciones.reduce((sum, e) => sum + calcularTotal(e.criterios), 0) / evaluaciones.length).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Este Mes</p>
                <p className="text-2xl text-slate-900 mt-1">
                  {evaluaciones.filter(e => e.mes === '2026-03').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Excelentes</p>
                <p className="text-2xl text-slate-900 mt-1">
                  {evaluaciones.filter(e => calcularTotal(e.criterios) >= 4.5).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Buscar por Nombre</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filtrar por Mes</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los meses</SelectItem>
                  {meses.map(mes => (
                    <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filtrar por Rol</Label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="Desarrollador">Desarrollador</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportarPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportarExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Promedios por Colaborador y Mes */}
      <Card>
        <CardHeader>
          <CardTitle>Promedios por Colaborador y Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 text-sm text-slate-700">Colaborador</th>
                  <th className="text-left p-3 text-sm text-slate-700">Mes</th>
                  <th className="text-center p-3 text-sm text-slate-700">Cantidad Evaluaciones</th>
                  <th className="text-center p-3 text-sm text-slate-700">Promedio</th>
                  <th className="text-center p-3 text-sm text-slate-700">Clasificación</th>
                </tr>
              </thead>
              <tbody>
                {promediosPorColaboradorMes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">
                      No hay evaluaciones para mostrar
                    </td>
                  </tr>
                ) : (
                  promediosPorColaboradorMes.map((promedio) => {
                    const clasificacion = getClasificacion(promedio.promedio);
                    return (
                      <tr key={promedio.key} className="border-t hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-900">{promedio.nombre}</td>
                        <td className="p-3 text-sm text-slate-600">{promedio.mes}</td>
                        <td className="p-3 text-sm text-center text-slate-600">{promedio.cantidadEvaluaciones}</td>
                        <td className="p-3 text-sm text-center font-medium text-blue-600">
                          {promedio.promedio.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={clasificacion.color}>{clasificacion.label}</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Evaluaciones Individuales */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones Individuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 text-sm text-slate-700">Colaborador</th>
                  <th className="text-left p-3 text-sm text-slate-700">Puesto</th>
                  <th className="text-left p-3 text-sm text-slate-700">Proyecto</th>
                  <th className="text-left p-3 text-sm text-slate-700">Período</th>
                  <th className="text-center p-3 text-sm text-slate-700">Calificación</th>
                  <th className="text-center p-3 text-sm text-slate-700">Clasificación</th>
                  <th className="text-center p-3 text-sm text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evaluacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-500">
                      No hay evaluaciones para mostrar
                    </td>
                  </tr>
                ) : (
                  evaluacionesFiltradas.map((evaluacion) => {
                    const total = calcularTotal(evaluacion.criterios);
                    const clasificacion = getClasificacion(total);
                    return (
                      <tr key={evaluacion.id} className="border-t hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-900">{evaluacion.colaborador}</td>
                        <td className="p-3 text-sm text-slate-600">{evaluacion.puesto}</td>
                        <td className="p-3 text-sm text-slate-600">{evaluacion.proyecto}</td>
                        <td className="p-3 text-sm text-slate-600">{evaluacion.periodo}</td>
                        <td className="p-3 text-sm text-center font-medium text-blue-600">
                          {total.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={clasificacion.color}>{clasificacion.label}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVerDetalle(evaluacion)}
                          >
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalle */}
      <Dialog open={!!verDetalle} onOpenChange={() => setVerDetalle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Evaluación de Desempeño</DialogTitle>
          </DialogHeader>
          {verDetalle && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-3">Información General</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Nombre del colaborador:</span>
                    <p className="font-medium text-slate-900">{verDetalle.colaborador}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Período de evaluación:</span>
                    <p className="font-medium text-slate-900">{verDetalle.periodo}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Puesto:</span>
                    <p className="font-medium text-slate-900">{verDetalle.puesto}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Evaluador:</span>
                    <p className="font-medium text-slate-900">{verDetalle.evaluador}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600">Proyecto(s) evaluado(s):</span>
                    <p className="font-medium text-slate-900">{verDetalle.proyecto}</p>
                  </div>
                </div>
              </div>

              {/* Criterios */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Criterios</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 text-sm text-slate-700">Criterio</th>
                        <th className="text-center p-3 text-sm text-slate-700">Peso</th>
                        <th className="text-center p-3 text-sm text-slate-700">Calificación (1-5)</th>
                        <th className="text-center p-3 text-sm text-slate-700">Puntaje Ponderado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verDetalle.criterios.map((criterio, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{criterio.nombre}</td>
                          <td className="p-3 text-sm text-center">{criterio.peso}</td>
                          <td className="p-3 text-sm text-center">{criterio.calificacion}</td>
                          <td className="p-3 text-sm text-center">{(criterio.peso * criterio.calificacion).toFixed(1)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50 font-bold">
                        <td colSpan={3} className="p-3 text-right">Total:</td>
                        <td className="p-3 text-center text-blue-600">
                          {calcularTotal(verDetalle.criterios).toFixed(1)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-600">Clasificación:</span>
                  <Badge className={getClasificacion(calcularTotal(verDetalle.criterios)).color}>
                    {getClasificacion(calcularTotal(verDetalle.criterios)).label}
                  </Badge>
                </div>
              </div>

              {/* Plan de Mejora */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-3">Plan de Mejora</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-600">Fortalezas identificadas:</span>
                    <p className="text-slate-900 mt-1">{verDetalle.fortalezas}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Áreas de mejora:</span>
                    <p className="text-slate-900 mt-1">{verDetalle.areasMejora}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Acciones recomendadas:</span>
                    <p className="text-slate-900 mt-1">{verDetalle.acciones}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Capacitación sugerida:</span>
                    <p className="text-slate-900 mt-1">{verDetalle.capacitacion}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setVerDetalle(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
