import { useState } from "react";
import { Trash } from "lucide-react";
import type { Observacion } from "../../types/ObservationsType";
import type { Cliente } from "../../types/ClientsType";
import { 
  fetchObservacionesByClienteId, 
  createObservacion, 
  deleteObservacion 
} from "../../data/ObservacionesCrud";
import { updateUltimaInteraccion } from "../../data/ClientsCrud";
import { formatearFecha } from "../../utils/dateUtils";
import { supabase } from "../../integrations/supabase";

interface ObservacionesClienteProps {
  clienteId: string;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente | null>>;
  observaciones: Observacion[];
  setObservaciones: React.Dispatch<React.SetStateAction<Observacion[]>>;
}

export const ObservacionesCliente = ({ 
  clienteId, 
  cliente, 
  setCliente, 
  observaciones, 
  setObservaciones 
}: ObservacionesClienteProps) => {
  const [nuevaNota, setNuevaNota] = useState<string>("");
  const [loadingObservaciones, setLoadingObservaciones] = useState<boolean>(false);

  // Función para mostrar texto vacío en gris claro
  const vacio = () => <span className="text-gray-400">Sin datos</span>;

  // Función para obtener el usuario actual
  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  };

  const handleAgregarNota = async () => {
    console.log("Iniciando handleAgregarNota", {
      nuevaNota: nuevaNota.trim(),
      clienteId,
    });
    if (nuevaNota.trim() && clienteId) {
      setLoadingObservaciones(true);

      try {
        // Obtener el usuario actual para el id_vendedor
        const user = await getCurrentUser();
        console.log("Usuario actual:", user);

        // Verificar si el cliente existe en la base de datos
        if (!cliente) {
          throw new Error("Cliente no encontrado");
        }

        // Crear nueva observación
        // Asegurarse de que id_cliente sea un UUID válido
        const nuevaObservacion: Observacion = {
          id_cliente: clienteId, // Este debe ser un UUID válido
          id_vendedor: user?.email || "", // Usar el email del usuario en sesión actual
          observacion: nuevaNota.trim(),
        };
        console.log("Nueva observación a crear:", nuevaObservacion);

        const resultado = await createObservacion(nuevaObservacion);
        console.log("Resultado de createObservacion:", resultado);

        // Si la creación fue exitosa, recargar las observaciones
        if (resultado && resultado.length > 0) {
          console.log("Recargando observaciones para cliente ID:", clienteId);
          const observacionesActualizadas = await fetchObservacionesByClienteId(
            clienteId
          );
          console.log("Observaciones actualizadas:", observacionesActualizadas);
          setObservaciones(observacionesActualizadas);

          // Actualizar la fecha de última interacción del cliente con la fecha de la nueva observación
          const nuevaObservacionCreada = resultado[0];
          if (nuevaObservacionCreada && nuevaObservacionCreada.created_at) {
            console.log(
              "Actualizando última interacción del cliente con la fecha:",
              nuevaObservacionCreada.created_at
            );

            // Actualizar en la base de datos
            await updateUltimaInteraccion(
              clienteId,
              nuevaObservacionCreada.created_at
            );

            // Actualizar en el estado local
            if (cliente) {
              setCliente({
                ...cliente,
                ultima_interaccion: nuevaObservacionCreada.created_at,
              });
            }
          }

          // Limpiar el campo de texto
          setNuevaNota("");
        } else {
          console.error("No se pudo crear la observación");
        }
      } catch (error) {
        console.error("Error al agregar la observación:", error);
      } finally {
        setLoadingObservaciones(false);
      }
    } else {
      console.log(
        "No se puede agregar nota: texto vacío o ID de cliente no disponible"
      );
    }
  };

  // Función para borrar una observación
  const handleBorrarObservacion = async (observacionId: number) => {
    if (!clienteId) return;

    try {
      setLoadingObservaciones(true);
      console.log(`Borrando observación con ID: ${observacionId}`);

      // Borrar la observación
      const resultado = await deleteObservacion(observacionId);

      if (resultado) {
        // Recargar las observaciones
        const observacionesActualizadas = await fetchObservacionesByClienteId(
          clienteId
        );
        setObservaciones(observacionesActualizadas);

        // Actualizar la fecha de última interacción
        if (observacionesActualizadas && observacionesActualizadas.length > 0) {
          // Si aún quedan observaciones, usar la fecha de la más reciente
          const observacionesOrdenadas = [...observacionesActualizadas].sort(
            (a, b) =>
              new Date(b.created_at || "").getTime() -
              new Date(a.created_at || "").getTime()
          );

          const ultimaObservacion = observacionesOrdenadas[0];
          if (ultimaObservacion && ultimaObservacion.created_at && cliente) {
            // Actualizar la fecha de última interacción en la base de datos
            await updateUltimaInteraccion(clienteId, ultimaObservacion.created_at);

            // Actualizar el cliente en el estado local
            setCliente({
              ...cliente,
              ultima_interaccion: ultimaObservacion.created_at,
            });
          }
        } else if (cliente) {
          // Si no quedan observaciones, usar la fecha de creación como última interacción
          if (cliente.created_at) {
            // Actualizar la fecha de última interacción en la base de datos
            await updateUltimaInteraccion(clienteId, cliente.created_at);

            // Actualizar el cliente en el estado local
            setCliente({
              ...cliente,
              ultima_interaccion: cliente.created_at,
            });
          }
        }
      } else {
        console.error("No se pudo borrar la observación");
      }
    } catch (error) {
      console.error("Error al borrar la observación:", error);
    } finally {
      setLoadingObservaciones(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Observaciones del Cliente
      </h2>

      {loadingObservaciones ? (
        <div className="text-center py-4">Cargando observaciones...</div>
      ) : observaciones.length > 0 ? (
        observaciones.map((observacion) => (
          <div
            key={observacion.id}
            className="mb-6 border border-gray-500 rounded-lg p-4 overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 ">
                <div className="flex flex-wrap items-center space-x-2">
                  <p className="font-medium text-gray-700">
                    Fecha de contacto:
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(observacion.created_at, true)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center space-x-2 mb-3">
                  <p className="font-medium text-gray-700">Vendedor:</p>
                  <p className="text-sm text-gray-500">
                    {observacion.id_vendedor
                      ? observacion.id_vendedor
                      : vacio()}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {observacion.observacion}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() =>
                  handleBorrarObservacion(observacion.id as number)
                }
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                title="Borrar observación"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-gray-500">
          No hay observaciones para este cliente
        </div>
      )}

      <textarea
        className="bg-white w-full border border-gray-200 rounded-lg p-4 mt-4 text-sm"
        placeholder="Añadir una nueva observacion..."
        value={nuevaNota}
        onChange={(e) => setNuevaNota(e.target.value)}
        rows={4}
        disabled={loadingObservaciones}
      />
      <button
        onClick={handleAgregarNota}
        className="cursor-pointer mt-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md flex items-center justify-center w-full"
        disabled={loadingObservaciones || !nuevaNota.trim()}
      >
        {loadingObservaciones ? (
          "Guardando..."
        ) : (
          <>
            Agregar Observacion
          </>
        )}
      </button>
    </div>
  );
};
