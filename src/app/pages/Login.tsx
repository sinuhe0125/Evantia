import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FolderKanban, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) navigate('/dashboard');
      else setError('Email o contraseña incorrectos.');
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-600 mb-4 shadow-lg">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-1">DevStream</h1>
          <p className="text-slate-500">Sistema de Gestión de Proyectos</p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@devstream.cl"
                  required autoFocus autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPwd ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="pr-10"
                    required autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 mt-2" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando...</> : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Accesos de prueba</p>
              {[
                { email:'admin@devstream.cl',   pwd:'Admin2024!', rol:'Administrador' },
                { email:'roberto@devstream.cl', pwd:'Roberto123', rol:'Supervisor'    },
                { email:'carlos@devstream.cl',  pwd:'Carlos123',  rol:'Operador'      },
              ].map(u => (
                <button key={u.email} type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.pwd); setError(''); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                  <span className="text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{u.rol}:</span> {u.email}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
