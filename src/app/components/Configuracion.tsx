import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Building2, Bell, Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ConfigEmpresa {
  nombre: string;
  sitioWeb: string;
  email: string;
  telefono: string;
}

interface ConfigNotificaciones {
  nuevoProyecto: boolean;
  cambioEstado: boolean;
  trabajadorAsignado: boolean;
  resumenSemanal: boolean;
}

const CONFIG_EMPRESA_KEY = 'config_empresa';
const CONFIG_NOTIF_KEY   = 'config_notificaciones';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

export function Configuracion() {
  // Empresa
  const [empresa, setEmpresa] = useState<ConfigEmpresa>(() =>
    loadJSON(CONFIG_EMPRESA_KEY, {
      nombre:    'DevStream Technologies',
      sitioWeb:  'https://devstream.cl',
      email:     'admin@devstream.cl',
      telefono:  '+56 2 1234 5678',
    })
  );
  const [empresaSaved, setEmpresaSaved] = useState(false);

  // Notificaciones
  const [notif, setNotif] = useState<ConfigNotificaciones>(() =>
    loadJSON(CONFIG_NOTIF_KEY, {
      nuevoProyecto:     true,
      cambioEstado:      true,
      trabajadorAsignado: true,
      resumenSemanal:    false,
    })
  );

  // Contraseña
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [showPwd, setShowPwd] = useState({ actual: false, nueva: false, confirmar: false });
  const [pwdError, setPwdError] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  // Guardar notificaciones automáticamente al cambiar
  useEffect(() => {
    localStorage.setItem(CONFIG_NOTIF_KEY, JSON.stringify(notif));
  }, [notif]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGuardarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(CONFIG_EMPRESA_KEY, JSON.stringify(empresa));
    setEmpresaSaved(true);
    setTimeout(() => setEmpresaSaved(false), 3000);
  };

  const handleCambiarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (!passwords.actual) { setPwdError('Ingresa tu contraseña actual.'); return; }
    if (passwords.nueva.length < 6) { setPwdError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    if (passwords.nueva !== passwords.confirmar) { setPwdError('Las contraseñas no coinciden.'); return; }
    // En una app real aquí iría la llamada al backend
    setPwdSaved(true);
    setPasswords({ actual: '', nueva: '', confirmar: '' });
    setTimeout(() => setPwdSaved(false), 3000);
  };

  const handleResetDatos = () => {
    if (!window.confirm('¿Estás seguro? Esto eliminará TODOS los datos del sistema y no se puede deshacer.')) return;
    const keysToKeep = ['isAuthenticated', 'userName', 'userRole', 'userEmail'];
    Object.keys(localStorage).forEach(k => {
      if (!keysToKeep.includes(k)) localStorage.removeItem(k);
    });
    window.location.reload();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-slate-800">Configuración del Sistema</h2>
        <p className="text-slate-600 mt-1">Ajusta las preferencias de tu plataforma de gestión de proyectos</p>
      </div>

      {/* Información de la empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-600" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardarEmpresa} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-empresa">Nombre de la Empresa</Label>
                <Input
                  id="nombre-empresa"
                  value={empresa.nombre}
                  onChange={e => setEmpresa({ ...empresa, nombre: e.target.value })}
                  placeholder="Ej: DevStream Technologies"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sitio-web">Sitio Web</Label>
                <Input
                  id="sitio-web"
                  type="url"
                  value={empresa.sitioWeb}
                  onChange={e => setEmpresa({ ...empresa, sitioWeb: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-empresa">Email de Contacto</Label>
                <Input
                  id="email-empresa"
                  type="email"
                  value={empresa.email}
                  onChange={e => setEmpresa({ ...empresa, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono-empresa">Teléfono</Label>
                <Input
                  id="telefono-empresa"
                  type="tel"
                  value={empresa.telefono}
                  onChange={e => setEmpresa({ ...empresa, telefono: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                Guardar Cambios
              </Button>
              {empresaSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Guardado correctamente
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              { key: 'nuevoProyecto',     label: 'Nuevo Proyecto',         desc: 'Alerta cuando se crea un proyecto nuevo' },
              { key: 'cambioEstado',      label: 'Cambio de Estado',       desc: 'Notifica al cambiar el estado de un proyecto' },
              { key: 'trabajadorAsignado',label: 'Asignación de Personal', desc: 'Avisa cuando se asigna un trabajador a un proyecto' },
              { key: 'resumenSemanal',    label: 'Resumen Semanal',        desc: 'Envía un resumen con el avance de todos los proyectos' },
            ] as { key: keyof ConfigNotificaciones; label: string; desc: string }[]
          ).map(({ key, label, desc }, i, arr) => (
            <div key={key}>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-slate-800">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <Switch
                  checked={notif[key]}
                  onCheckedChange={v => setNotif({ ...notif, [key]: v })}
                />
              </div>
              {i < arr.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-600" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            {(['actual', 'nueva', 'confirmar'] as const).map(campo => (
              <div key={campo} className="space-y-2">
                <Label htmlFor={`pwd-${campo}`}>
                  {campo === 'actual' ? 'Contraseña Actual' : campo === 'nueva' ? 'Nueva Contraseña' : 'Confirmar Nueva Contraseña'}
                </Label>
                <div className="relative">
                  <Input
                    id={`pwd-${campo}`}
                    type={showPwd[campo] ? 'text' : 'password'}
                    value={passwords[campo]}
                    onChange={e => setPasswords({ ...passwords, [campo]: e.target.value })}
                    className="pr-10"
                    placeholder={campo === 'nueva' ? 'Mínimo 6 caracteres' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, [campo]: !showPwd[campo] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPwd[campo] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}

            {pwdError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {pwdError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                Actualizar Contraseña
              </Button>
              {pwdSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Contraseña actualizada
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Zona de peligro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Las siguientes acciones son <strong>irreversibles</strong>. Todos los datos (proyectos, trabajadores, cargos, roles)
              se eliminarán del almacenamiento local. Procede con precaución.
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={handleResetDatos}
          >
            Eliminar Todos los Datos del Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
