import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Bell, Lock, Globe, Palette, Database } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Configuración</h1>
        <p className="text-slate-600 mt-1">Administra las preferencias del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input id="company-name" defaultValue="Soft IA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email de Contacto</Label>
            <Input id="company-email" type="email" defaultValue="contacto@softia.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-phone">Teléfono</Label>
            <Input id="company-phone" type="tel" defaultValue="+34 123 456 789" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-address">Dirección</Label>
            <Textarea id="company-address" defaultValue="Calle Principal 123, Madrid, España" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Notificaciones por Email</p>
              <p className="text-sm text-slate-500">Recibe notificaciones importantes por correo electrónico</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Notificaciones de Nuevos Usuarios</p>
              <p className="text-sm text-slate-500">Alerta cuando se registra un nuevo usuario</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Alertas de Stock Bajo</p>
              <p className="text-sm text-slate-500">Notifica cuando el inventario está bajo</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Reportes Semanales</p>
              <p className="text-sm text-slate-500">Recibe resumen semanal de actividad</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Autenticación de Dos Factores</p>
              <p className="text-sm text-slate-500">Añade una capa extra de seguridad</p>
            </div>
            <Switch />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Actualizar Contraseña</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Modo Oscuro</p>
              <p className="text-sm text-slate-500">Cambia a tema oscuro</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Color Principal</Label>
            <div className="flex gap-3">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                <button
                  key={color}
                  className="w-10 h-10 rounded-lg border-2 border-slate-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p>Respaldo de Datos</p>
            <p className="text-sm text-slate-500">Último respaldo: 5 de Noviembre, 2025</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">Crear Respaldo</Button>
            <Button variant="outline">Restaurar Respaldo</Button>
          </div>
          <Separator />
          <div className="space-y-1">
            <p className="text-red-600">Zona de Peligro</p>
            <p className="text-sm text-slate-500">Acciones irreversibles</p>
          </div>
          <Button variant="destructive">Eliminar Todos los Datos</Button>
        </CardContent>
      </Card>
    </div>
  );
}
