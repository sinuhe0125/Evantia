import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export function PerfilUsuario() {
  const { authUser } = useApp();
  const [perfilData, setPerfilData] = useState({
    nombre: authUser?.nombre || 'Usuario',
    email: authUser?.email || '',
    telefono: '+56 9 8765 4321',
    cargo: 'Administradora',
    rol: 'Administrador'
  });

  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  });
  const [showPasswords, setShowPasswords] = useState({ actual: false, nueva: false, confirmar: false });

  const handleUpdatePerfil = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Actualizando perfil:', perfilData);
    alert('Perfil actualizado exitosamente');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.passwordNueva !== passwordData.passwordConfirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Cambiando contraseña');
    alert('Contraseña actualizada exitosamente');
    setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-800">Mi Perfil</h2>
          <p className="text-slate-600 mt-1">Gestiona tu información personal y preferencias</p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Foto de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl">
              MG
            </div>
            <Button variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Cambiar Foto
            </Button>
            <div className="text-center">
              <p className="font-medium text-slate-900">{perfilData.nombre}</p>
              <Badge className="bg-blue-100 text-blue-700 mt-2">{perfilData.rol}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Información */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="datos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="datos">Datos Personales</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
            </TabsList>

            <TabsContent value="datos">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePerfil} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="nombre"
                            value={perfilData.nombre}
                            onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            value={perfilData.email}
                            onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="telefono"
                            value={perfilData.telefono}
                            onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          value={perfilData.cargo}
                          onChange={(e) => setPerfilData({ ...perfilData, cargo: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguridad">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="passwordActual">Contraseña Actual</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="passwordActual"
                          type={showPasswords.actual ? 'text' : 'password'}
                          value={passwordData.passwordActual}
                          onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, actual: !showPasswords.actual })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                          {showPasswords.actual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="passwordNueva">Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="passwordNueva"
                          type={showPasswords.nueva ? 'text' : 'password'}
                          value={passwordData.passwordNueva}
                          onChange={(e) => setPasswordData({ ...passwordData, passwordNueva: e.target.value })}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, nueva: !showPasswords.nueva })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                          {showPasswords.nueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="passwordConfirmar">Confirmar Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="passwordConfirmar"
                          type={showPasswords.confirmar ? 'text' : 'password'}
                          value={passwordData.passwordConfirmar}
                          onChange={(e) => setPasswordData({ ...passwordData, passwordConfirmar: e.target.value })}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                          {showPasswords.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">Requisitos de contraseña:</p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Mínimo 8 caracteres</li>
                        <li>Al menos una letra mayúscula</li>
                        <li>Al menos un número</li>
                        <li>Al menos un carácter especial</li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Lock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actividad">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { fecha: '2026-03-01 09:15', accion: 'Inicio de sesión', ip: '192.168.1.45' },
                      { fecha: '2026-03-01 09:10', accion: 'Creó proyecto "Modernización Ascensores"', ip: '192.168.1.45' },
                      { fecha: '2026-02-29 18:30', accion: 'Actualizó unidad "Depto 102"', ip: '192.168.1.45' },
                      { fecha: '2026-02-29 17:45', accion: 'Exportó reporte de pagos', ip: '192.168.1.45' },
                      { fecha: '2026-02-29 16:20', accion: 'Cerró sesión', ip: '192.168.1.45' },
                    ].map((actividad, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{actividad.accion}</p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-xs text-slate-500">{actividad.fecha}</p>
                            <p className="text-xs text-slate-500">IP: {actividad.ip}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
