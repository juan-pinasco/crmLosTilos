import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';

export const Header = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Obtener la sesión actual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserEmail(data.session.user.email || null);
      }
    };

    getSession();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user.email || null);
      }
    );

    // Limpiar la suscripción al desmontar el componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Título a la izquierda */}
        <h1 className="text-green-600 text-2xl font-bold">Los Tilos</h1>
        
        {/* Email y botón de cerrar sesión a la derecha */}
        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
