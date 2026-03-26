import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Login() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border-t-4 border-primary">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-secondary p-3 rounded-full mb-4 shadow-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-primary">Acceso RRHH</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">Inicia sesión para gestionar equipos y puntos.</p>
        </div>
        
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          providers={[]} 
          theme="light" 
        />
        
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary hover:underline">Volver al Tablero General</a>
        </div>
      </div>
    </div>
  );
}