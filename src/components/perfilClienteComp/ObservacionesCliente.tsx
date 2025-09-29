import { useState } from "react";
import { Trash } from "lucide-react";
import type { Observacion } from "../../types/ObservationsType";
import type { Cliente } from "../../types/ClientsType";
import {
  fetchObservacionesByClienteId,
  createObservacion,
  deleteObservacion,
} from "../../data/ObservacionesCrud";
import { updateUltimaInteraccion } from "../../data/ClientsCrud";
import { fetchVendedorByAuthId } from "../../data/VendedoresCrud";
import { formatearFecha } from "../../utils/dateUtils";
import { supabase } from "../../integrations/supabase";
import Swal from "sweetalert2";

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
  setObservaciones,
}: ObservacionesClienteProps) => {
  const [nuevaNota, setNuevaNota] = useState<string>("");
  const [fechaObservacion, setFechaObservacion] = useState<string>("");
  const [loadingObservaciones, setLoadingObservaciones] =
    useState<boolean>(false);

  // Función para mostrar texto vacío en gris claro
  const vacio = () => <span className="text-gray-400">Sin datos</span>;

  // Función para obtener el usuario actual
  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  };

  // Función para obtener el vendedor a partir del ID de autenticación
  const getVendedorByAuthId = async (authUserId: string) => {
    try {
      const vendedor = await fetchVendedorByAuthId(authUserId);
      if (!vendedor) {
        console.error(
          "No se encontró el vendedor con auth_user_id:",
          authUserId
        );
        return null;
      }
      return vendedor;
    } catch (error) {
      console.error("Error al buscar el vendedor:", error);
      return null;
    }
  };

  // Función para obtener la fecha y hora actual en formato ISO local
  const getFechaActual = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Inicializar la fecha con la fecha actual cuando el componente se monta
  useState(() => {
    setFechaObservacion(getFechaActual());
  });

  const handleAgregarNota = async () => {
    if (nuevaNota.trim() && clienteId) {
      // Mostrar alerta de confirmación antes de agregar la observación
      Swal.fire({
        title: "¿Confirmar observación?",
        text: "¿Deseas agregar esta observación?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981", // Verde para confirmar
        cancelButtonColor: "#6B7280", // Gris para cancelar
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        // Si el usuario confirma, procedemos con la adición de la observación
        if (result.isConfirmed) {
          setLoadingObservaciones(true);

          try {
            // Obtener el usuario actual para el id_vendedor
            const user = await getCurrentUser();

            // Verificar si el cliente existe en la base de datos
            if (!cliente) {
              throw new Error("Cliente no encontrado");
            }

            let vendedorId = null;
            let nombreVendedor = null;

            if (user?.id) {
              const vendedor = await getVendedorByAuthId(user.id);
              if (vendedor) {
                vendedorId = vendedor.id;
                nombreVendedor = vendedor.nombre;
              }
            }

            if (!vendedorId) {
              console.warn("No se pudo obtener el ID del vendedor");
            }

            // Crear nueva observación
            const nuevaObservacion: Observacion = {
              id_cliente: clienteId,
              id_vendedor: vendedorId || null,
              observacion: nuevaNota.trim(),
              created_at: fechaObservacion
                ? new Date(fechaObservacion).toISOString()
                : new Date().toISOString(),
              nombre_vendedor: nombreVendedor || null,
            };

            const resultado = await createObservacion(nuevaObservacion);

            // Si la creación fue exitosa, recargar las observaciones
            if (resultado && resultado.length > 0) {
              const observacionesActualizadas =
                await fetchObservacionesByClienteId(clienteId);
              setObservaciones(observacionesActualizadas);

              // Actualizar la fecha de última interacción del cliente
              // Buscar la observación con la fecha más reciente (no necesariamente la recién creada)
              if (
                observacionesActualizadas &&
                observacionesActualizadas.length > 0
              ) {
                // Ordenar las observaciones por fecha descendente para obtener la más reciente
                const observacionesOrdenadas = [
                  ...observacionesActualizadas,
                ].sort(
                  (a, b) =>
                    new Date(b.created_at || "").getTime() -
                    new Date(a.created_at || "").getTime()
                );

                const observacionMasReciente = observacionesOrdenadas[0];
                if (
                  observacionMasReciente &&
                  observacionMasReciente.created_at
                ) {
                  // Actualizar en la base de datos
                  await updateUltimaInteraccion(
                    clienteId,
                    observacionMasReciente.created_at
                  );

                  // Actualizar en el estado local
                  if (cliente) {
                    setCliente({
                      ...cliente,
                      ultima_interaccion: observacionMasReciente.created_at,
                    });
                  }
                }
              }
              // Limpiar los campos
              setNuevaNota("");
              setFechaObservacion(getFechaActual());

              // Mostrar alerta de éxito
              Swal.fire({
                icon: "success",
                title: "¡Observación agregada!",
                text: "La observación ha sido guardada correctamente",
                confirmButtonColor: "#10B981",
                timer: 2000,
                timerProgressBar: true,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo crear la observación",
                confirmButtonColor: "#EF4444",
              });
            }
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Ocurrió un error al agregar la observación",
              confirmButtonColor: "#EF4444",
            });
          } finally {
            setLoadingObservaciones(false);
          }
        }
      });
    }
  };

  // Función para borrar una observación
  const handleBorrarObservacion = async (observacionId: number) => {
    if (!clienteId) return;

    // Mostrar alerta de confirmación antes de borrar
    Swal.fire({
      title: "¿Eliminar observación?",
      text: "¿Estás seguro de que deseas eliminar esta observación? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", // Rojo para confirmar eliminación
      cancelButtonColor: "#6B7280", // Gris para cancelar
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      // Si el usuario confirma, procedemos con la eliminación
      if (result.isConfirmed) {
        try {
          setLoadingObservaciones(true);

          // Borrar la observación
          const resultado = await deleteObservacion(observacionId);

          if (resultado) {
            // Recargar las observaciones
            const observacionesActualizadas =
              await fetchObservacionesByClienteId(clienteId);
            setObservaciones(observacionesActualizadas);

            // Actualizar la fecha de última interacción
            if (
              observacionesActualizadas &&
              observacionesActualizadas.length > 0
            ) {
              // Si aún quedan observaciones, usar la fecha de la más reciente
              const observacionesOrdenadas = [
                ...observacionesActualizadas,
              ].sort(
                (a, b) =>
                  new Date(b.created_at || "").getTime() -
                  new Date(a.created_at || "").getTime()
              );

              const ultimaObservacion = observacionesOrdenadas[0];
              if (
                ultimaObservacion &&
                ultimaObservacion.created_at &&
                cliente
              ) {
                // Actualizar la fecha de última interacción en la base de datos
                await updateUltimaInteraccion(
                  clienteId,
                  ultimaObservacion.created_at
                );

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

            // Mostrar alerta de éxito
            Swal.fire({
              icon: "success",
              title: "Observación eliminada",
              text: "La observación ha sido eliminada correctamente",
              confirmButtonColor: "#10B981",
              timer: 2000,
              timerProgressBar: true,
            });
          } else {
            // Mostrar alerta de error
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo eliminar la observación",
              confirmButtonColor: "#EF4444",
            });
          }
        } catch (error) {
          // Mostrar alerta de error
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al eliminar la observación",
            confirmButtonColor: "#EF4444",
          });
        } finally {
          setLoadingObservaciones(false);
        }
      }
    });
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
                  <p className="font-medium text-gray-700">Creador nota:</p>
                  <p className="text-sm text-gray-500">
                    {observacion.nombre_vendedor
                      ? observacion.nombre_vendedor
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

      <div className="mt-4  border border-dashed border-green-500 p-2 rounded-lg">
        <textarea
          className="bg-white w-full border border-gray-200 rounded-lg p-4 text-sm"
          placeholder="Añadir una nueva observacion..."
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          rows={4}
          disabled={loadingObservaciones}
        />
        <div className="mb-4">
          <label
            htmlFor="fechaObservacion"
            className="block text-sm font-medium text-gray-700 mb-1"
          ></label>
          <input
            id="fechaObservacion"
            type="datetime-local"
            className="w-full border border-gray-200 bg-white rounded-lg p-2 text-sm"
            value={fechaObservacion}
            onChange={(e) => setFechaObservacion(e.target.value)}
            disabled={loadingObservaciones}
          />
        </div>
        <button
          onClick={handleAgregarNota}
          className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md flex items-center justify-center w-full"
          disabled={loadingObservaciones || !nuevaNota.trim()}
        >
          {loadingObservaciones ? "Guardando..." : <>Agregar Observacion</>}
        </button>
      </div>
    </div>
  );
};
