import { useState, useEffect } from 'react';
import { clearOnLogout } from '../utils/storageManager';
import { supabase } from '../integrations/supabase';
import { GetSession } from '../data/AuthsCrud';
import { useLocation } from 'react-router';

export const Header = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Obtener la sesión actual
    const getSession = async () => {
      const session = await GetSession();
      if (session) {
        setUserEmail(session.email || null);
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
            // Limpiar localStorage de forma centralizada y notificar a la aplicación
      await clearOnLogout();
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      console.log('Se ha cerrado sesión y se han limpiado los filtros del localStorage');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const location = useLocation();

  // Función para determinar si una pestaña está activa
  const isActive = (path: string) => {
    return location.pathname === path ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-green-600';
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Título a la izquierda */}
          <h1 className="text-green-600 text-2xl font-bold">Los Tilos</h1>
          
          {/* Pestañas de navegación en el medio */}
          {userEmail && (
            <nav className="flex space-x-6">
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = '/';
                }}
                className={`py-2 px-3 font-medium ${isActive('/')}`}
              >
                Clientes
              </a>
              <a 
                href="/eventos" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = '/eventos';
                }}
                className={`py-2 px-3 font-medium ${isActive('/eventos')}`}
              >
                Eventos
              </a>
            </nav>
          )}
          
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
      </div>
    </header>
  );
};
