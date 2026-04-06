import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Trophy, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

export default function Login() {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Si ya hay sesión, redirigir al inicio
  if (session) {
    return <Navigate to="/" />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // Registrar nuevo usuario
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session === null && data.user) {
          showSuccess("Cuenta creada. Si no puedes entrar, desactiva 'Confirm Email' en Supabase.");
        } else {
          showSuccess("Usuario creado con éxito. Ya puedes iniciar sesión.");
        }
        
        setIsRegistering(false);
      } else {
        // Iniciar sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Debes confirmar tu correo o desactivar la confirmación en Supabase Auth.");
          }
          throw error;
        }
        
        showSuccess("Sesión iniciada correctamente.");
      }
    } catch (error: any) {
      showError(error.message || "Credenciales incorrectas o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border-t-4 border-primary relative overflow-hidden">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-secondary p-3 rounded-full mb-4 shadow-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-primary">
            {isRegistering ? "Crear cuenta RRHH" : "Acceso RRHH"}
          </h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {isRegistering 
              ? "Registra un usuario administrador." 
              : "Inicia sesión para gestionar puntos."}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@correo.com" 
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isRegistering ? "Crear cuenta" : "Ingresar"}
          </Button>
        </form>

        {isRegistering && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>Atención:</strong> Si vas a usar un correo inventado, asegúrate de desactivar "Confirm email" en los ajustes de Auth de tu panel de Supabase.</p>
          </div>
        )}

        <div className="mt-6 text-center space-y-4">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-secondary font-medium hover:underline"
          >
            {isRegistering 
              ? "¿Ya tienes cuenta? Inicia sesión aquí" 
              : "¿No tienes cuenta? Regístrate aquí"}
          </button>
          
          <div className="pt-4 border-t border-gray-100">
            <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
              ← Volver al Tablero General
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}