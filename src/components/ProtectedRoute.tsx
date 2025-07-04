import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { supabase } from '../integrations/supabase';

export const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Limpiar la suscripción al desmontar el componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirigir a la página de autenticación si el usuario no está autenticado
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Renderizar el contenido protegido si el usuario está autenticado
  return <Outlet />;
};
