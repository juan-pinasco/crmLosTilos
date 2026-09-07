import { useState, useEffect } from "react";
import { Trash, SquarePen } from "lucide-react";
import type { Observacion } from "../../types/ObservationsType";
import type { Cliente } from "../../types/ClientsType";
import {
  fetchObservacionesByClienteId,
  createObservacion,
  deleteObservacion,
  updateObservacion,
} from "../../data/ObservacionesCrud";
import { updateUltimaInteraccion } from "../../data/ClientsCrud";
import { fetchVendedorByAuthId, fetchVendedores } from "../../data/VendedoresCrud";
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
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<string>("");
  const [loadingObservaciones, setLoadingObservaciones] =
    useState<boolean>(false);
  
  // Estados para la edición
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEditando, setTextoEditando] = useState<string>("");
  const [fechaEditando, setFechaEditando] = useState<string>("");
  const [vendedorEditando, setVendedorEditando] = useState<string>("");
  const [vendedores, setVendedores] = useState<any[]>([]);

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

  // Cargar vendedores al montar el componente
  useEffect(() => {
    const loadVendedores = async () => {
      try {
        const data = await fetchVendedores();
        if (data) {
          setVendedores(data);
          
          // Preseleccionar el usuario actual
          const user = await getCurrentUser();
          if (user?.id) {
            const vendedorActual = await getVendedorByAuthId(user.id);
            if (vendedorActual) {
              setVendedorSeleccionado(vendedorActual.id);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar vendedores:", error);
      }
    };

    loadVendedores();
  }, []);

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
            // Verificar si el cliente existe en la base de datos
            if (!cliente) {
              throw new Error("Cliente no encontrado");
            }

            // Usar el vendedor seleccionado o el usuario actual como fallback
            let vendedorId = vendedorSeleccionado || null;
            let nombreVendedor = null;

            if (vendedorId) {
              // Buscar el nombre del vendedor seleccionado
              const vendedorEncontrado = vendedores.find(v => v.id === vendedorId);
              nombreVendedor = vendedorEncontrado?.nombre || null;
            } else {
              // Fallback: usar el usuario actual si no se seleccionó vendedor
              const user = await getCurrentUser();
              if (user?.id) {
                const vendedor = await getVendedorByAuthId(user.id);
                if (vendedor) {
                  vendedorId = vendedor.id;
                  nombreVendedor = vendedor.nombre;
                }
              }
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
              // Limpiar los campos y preseleccionar usuario actual
              setNuevaNota("");
              setFechaObservacion(getFechaActual());
              
              // Volver a preseleccionar el usuario actual
              const user = await getCurrentUser();
              if (user?.id) {
                const vendedorActual = await getVendedorByAuthId(user.id);
                if (vendedorActual) {
                  setVendedorSeleccionado(vendedorActual.id);
                } else {
                  setVendedorSeleccionado("");
                }
              } else {
                setVendedorSeleccionado("");
              }

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

  // Función para iniciar la edición de una observación
  const handleEditarObservacion = (observacion: Observacion) => {
    setEditandoId(observacion.id as number);
    setTextoEditando(observacion.observacion);
    setVendedorEditando(observacion.id_vendedor || "");
    
    // Convertir la fecha a formato datetime-local
    if (observacion.created_at) {
      const fecha = new Date(observacion.created_at);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const hours = String(fecha.getHours()).padStart(2, "0");
      const minutes = String(fecha.getMinutes()).padStart(2, "0");
      setFechaEditando(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  };

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditando("");
    setFechaEditando("");
    setVendedorEditando("");
  };

  // Función para guardar la edición
  const handleGuardarEdicion = async () => {
    if (!editandoId || !textoEditando.trim()) return;

    try {
      setLoadingObservaciones(true);

      const resultado = await updateObservacion(
        editandoId,
        textoEditando.trim(),
        fechaEditando,
        vendedorEditando
      );

      if (resultado) {
        // Recargar las observaciones
        const observacionesActualizadas = await fetchObservacionesByClienteId(clienteId);
        setObservaciones(observacionesActualizadas);

        // Actualizar la fecha de última interacción si es necesario
        if (observacionesActualizadas && observacionesActualizadas.length > 0) {
          const observacionesOrdenadas = [...observacionesActualizadas].sort(
            (a, b) =>
              new Date(b.created_at || "").getTime() -
              new Date(a.created_at || "").getTime()
          );

          const observacionMasReciente = observacionesOrdenadas[0];
          if (observacionMasReciente && observacionMasReciente.created_at && cliente) {
            await updateUltimaInteraccion(clienteId, observacionMasReciente.created_at);
            setCliente({
              ...cliente,
              ultima_interaccion: observacionMasReciente.created_at,
            });
          }
        }

        // Limpiar el estado de edición
        handleCancelarEdicion();

        // Mostrar alerta de éxito
        Swal.fire({
          icon: "success",
          title: "¡Observación actualizada!",
          text: "La observación ha sido actualizada correctamente",
          confirmButtonColor: "#10B981",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar la observación",
          confirmButtonColor: "#EF4444",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar la observación",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoadingObservaciones(false);
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
            {editandoId === observacion.id ? (
              // Modo edición
              <div>
                <div className="mb-3">
                  <p className="font-medium text-gray-700 mb-2">Fecha de contacto:</p>
                  <input
                    type="datetime-local"
                    value={fechaEditando}
                    onChange={(e) => setFechaEditando(e.target.value)}
                    className="w-full lg:w-auto text-sm border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingObservaciones}
                  />
                </div>
                <div className="mb-3">
                  <p className="font-medium text-gray-700 mb-2">Creador nota:</p>
                  <select
                    value={vendedorEditando}
                    onChange={(e) => setVendedorEditando(e.target.value)}
                    className="w-full lg:w-auto text-sm border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingObservaciones}
                  >
                    {vendedores.map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={textoEditando}
                  onChange={(e) => setTextoEditando(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700 mb-3"
                  rows={4}
                  disabled={loadingObservaciones}
                />
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3 mt-4">
                  <button
                    onClick={handleGuardarEdicion}
                    disabled={loadingObservaciones || !textoEditando.trim()}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guardar cambios
                  </button>
                  <button
                    onClick={handleCancelarEdicion}
                    disabled={loadingObservaciones}
                    className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div>
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
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditarObservacion(observacion)}
                    disabled={loadingObservaciones}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Editar observación"
                  >
                    <SquarePen size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleBorrarObservacion(observacion.id as number)
                    }
                    disabled={loadingObservaciones}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Borrar observación"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            )}
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
          >
            Fecha de contacto:
          </label>
          <input
            id="fechaObservacion"
            type="datetime-local"
            className="w-full border border-gray-200 bg-white rounded-lg p-2 text-sm"
            value={fechaObservacion}
            onChange={(e) => setFechaObservacion(e.target.value)}
            disabled={loadingObservaciones}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="vendedorObservacion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Creador de la nota:
          </label>
          <select
            id="vendedorObservacion"
            value={vendedorSeleccionado}
            onChange={(e) => setVendedorSeleccionado(e.target.value)}
            className="w-full border border-gray-200 bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loadingObservaciones}
          >
            {vendedores.map((vendedor) => (
              <option key={vendedor.id} value={vendedor.id}>
                {vendedor.nombre}
              </option>
            ))}
          </select>
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
