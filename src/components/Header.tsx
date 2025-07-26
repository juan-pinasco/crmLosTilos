import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { clearOnLogout } from '../utils/storageManager';
import { supabase } from '../integrations/supabase';
import { GetSession } from '../data/AuthsCrud';
import { useLocation, useNavigate } from 'react-router';

export const Header = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<number>(0);

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

  // Obtener la cantidad de tareas pendientes del usuario actual
  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        if (!userEmail) {
          setPendingTasks(0);
          return;
        }
        const sessionUser = await GetSession();
        if (!sessionUser) {
          setPendingTasks(0);
          return;
        }
        // Buscar el vendedor vinculado al usuario autenticado
        const { data: vendedor, error: vendedorError } = await supabase
          .from('vendedores')
          .select('id')
          .eq('auth_user_id', sessionUser.id)
          .single();
        if (vendedorError) throw vendedorError;

        if (!vendedor?.id) {
          setPendingTasks(0);
          return;
        }

        // Contar tareas con estado pendiente o en progreso asignadas al vendedor
        const { count, error: countError } = await supabase
          .from('eventos')
          .select('id', { count: 'exact', head: true })
          .eq('tarea_vendedor_id', vendedor.id)
          .in('estado_tarea', ['Pendiente']);
        if (countError) throw countError;

        setPendingTasks(count || 0);
      } catch (err) {
        console.error('Error al obtener tareas pendientes:', err);
      }
    };

    fetchPendingTasks();
  }, [userEmail]);

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
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  // Función para determinar si una pestaña está activa
  const isActive = (path: string) => {
    return location.pathname === path ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-green-600';
  };

  return (
    <header className="bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          {/* Título a la izquierda */}
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="mr-4 focus:outline-none">
              <ArrowLeft className="cursor-pointer text-gray-600 w-6 h-6" strokeWidth={3} />
            </button>
            <h1 className="text-green-600 text-2xl font-bold">Los Tilos</h1>
          </div>
          
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
                className={`py-2 px-3 font-medium relative ${isActive('/eventos')}`}
              >
                Tareas
                {pendingTasks > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white rounded-full text-xs px-2">
                    {pendingTasks}
                  </span>
                )}
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
    </header>
  );
};
