import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl text-slate-800 mb-2">Página no encontrada</h2>
          <p className="text-slate-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-slate-600 mb-2">¿Necesitas ayuda?</p>
          <p className="text-xs text-slate-500">
            Contacta al soporte técnico o visita la sección de ayuda
          </p>
        </div>
      </div>
    </div>
  );
}
