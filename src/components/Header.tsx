import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { clearOnLogout } from "../utils/storageManager";
import { supabase } from "../integrations/supabase";
import { GetSession } from "../data/AuthsCrud";
import { useLocation, useNavigate } from "react-router";
import { fetchVendedorByAuthId } from "../data/VendedoresCrud";
import Swal from "sweetalert2";

export const Header = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [vendedorNombre, setVendedorNombre] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<number>(0);

  useEffect(() => {
    // Obtener la sesión actual
    const getSession = async () => {
      const session = await GetSession();
      if (session) {
        setUserEmail(session.email || null);
        // Buscar el vendedor asociado al usuario
        const vendedor = await fetchVendedorByAuthId(session.id);
        if (vendedor) {
          setVendedorNombre(vendedor.nombre);
        }
      }
    };

    getSession();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUserEmail(session?.user.email || null);
        if (session?.user) {
          const vendedor = await fetchVendedorByAuthId(session.user.id);
          if (vendedor) {
            setVendedorNombre(vendedor.nombre);
          } else {
            setVendedorNombre(null);
          }
        } else {
          setVendedorNombre(null);
        }
      },
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
          .from("vendedores")
          .select("id")
          .eq("auth_user_id", sessionUser.id)
          .single();
        if (vendedorError) throw vendedorError;

        if (!vendedor?.id) {
          setPendingTasks(0);
          return;
        }

        // Contar tareas con estado pendiente o en progreso asignadas al vendedor
        const { count, error: countError } = await supabase
          .from("eventos")
          .select("id", { count: "exact", head: true })
          .eq("tarea_vendedor_id", vendedor.id)
          .in("estado_tarea", ["Pendiente"]);
        if (countError) throw countError;

        setPendingTasks(count || 0);
      } catch (err) {
        console.error("Error al obtener tareas pendientes:", err);
      }
    };

    fetchPendingTasks();
  }, [userEmail]);

  const handleSignOut = async () => {
    try {
      // Mostrar confirmación con SweetAlert2
      const result = await Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Estás seguro que deseas cerrar sesión?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
        allowEscapeKey: true,
      });

      // Si el usuario confirma, cerrar sesión
      if (result.isConfirmed) {
        // Mostrar loading mientras se cierra sesión
        Swal.fire({
          title: "Cerrando sesión...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          // Limpiar localStorage de forma centralizada
          await clearOnLogout();

          // Cerrar sesión en Supabase con timeout para evitar bloqueos
          const signOutPromise = supabase.auth.signOut();
          const timeoutPromise = new Promise((resolve) =>
            setTimeout(resolve, 3000),
          );

          await Promise.race([signOutPromise, timeoutPromise]);
        } catch (signOutError) {
          console.error("Error al cerrar sesión en Supabase:", signOutError);
          // Continuar de todas formas para limpiar el estado local
        }

        // Forzar recarga de la página para limpiar cualquier estado residual
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Si hay cualquier error, forzar cierre de sesión de todas formas
      try {
        await clearOnLogout();
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Error en fallback de cierre de sesión:", e);
      }
      window.location.href = "/";
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  //const handleBack = () => navigate(-1);
  const handleBack = () => {
    navigate(-1);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Función para determinar si una pestaña está activa
  const isActive = (path: string) => {
    return location.pathname === path
      ? "border-b-2 border-green-600 text-green-600"
      : "text-gray-600 hover:text-green-600";
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="flex justify-between items-center">
        {/* Título a la izquierda */}
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="mr-4 focus:outline-none">
            <ArrowLeft
              className="cursor-pointer text-gray-600 w-6 h-6"
              strokeWidth={3}
            />
          </button>
          <img
            src="/logoLosTilos.svg"
            alt="Los Tilos Logo"
            className="w-8 h-8"
          />
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
                window.location.href = "/";
              }}
              className={`py-2 px-3 font-medium ${isActive("/")}`}
            >
              Clientes
            </a>
            <a
              href="/eventos"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "/eventos";
              }}
              className={`py-2 px-3 font-medium relative ${isActive("/eventos")}`}
            >
              Tareas
              {pendingTasks > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white rounded-full text-xs px-2">
                  {pendingTasks}
                </span>
              )}
            </a>
            <a
              href="/observaciones"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "/observaciones";
              }}
              className={`py-2 px-3 font-medium relative ${isActive("/observaciones")}`}
            >
              Observaciones
            </a>
            <a
              href="/userProfile"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "/userProfile";
              }}
              className={`py-2 px-3 font-medium relative ${isActive("/userProfile")}`}
            >
              Perfil
            </a>
          </nav>
        )}

        {/* Email y botón de cerrar sesión a la derecha */}
        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{vendedorNombre || userEmail}</span>
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
