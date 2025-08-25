import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import type { Evento } from "../../types/EventsType";
import { formatearFecha } from "../../utils/dateUtils";
import { fetchEventosByCliente } from "../../data/EventosCrud";
import { updateFechaRecontacto } from "../../data/ClientsCrud";
import { ESTADO_CLIENTE_COLORS } from "../../constants/estadosCliente";
import { TEMPERATURA_CLIENTE_COLORS } from "../../constants/temperaturasCliente";
import { TIPO_CLIENTE_COLORS } from "../../constants/tiposCliente";
import { EdicionCliente } from "./EdicionCliente";

interface InformacionClienteProps {
  cliente: Cliente;
  vendedores: Vendedor[];
  onClienteActualizado?: (clienteActualizado: Cliente) => void;
}

export const InformacionCliente = ({
  cliente,
  vendedores,
  onClienteActualizado,
}: InformacionClienteProps) => {
  // Estado local para mantener una copia actualizada del cliente
  const [clienteLocal, setClienteLocal] = useState<Cliente>(cliente);
  const [fechaRecontacto, setFechaRecontacto] = useState<string | null>(
    cliente.fecha_recontacto
  );
  const [isEditing, setIsEditing] = useState(false);
  const [clienteEditado, setClienteEditado] = useState<Cliente>({...cliente});

  // Actualizar el estado local cuando cambie el cliente en las props
  useEffect(() => {
    setClienteLocal(cliente);
    setFechaRecontacto(cliente.fecha_recontacto);
    setClienteEditado({...cliente});
  }, [cliente]);

  // Función para mostrar texto vacío en gris claro
  const vacio = () => <span className="text-gray-400">Sin datos</span>;

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string | null | undefined) => {
    if (!vendedorId) return vacio();
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : vacio();
  };

  // Función para obtener la fecha más lejana de los eventos
  const obtenerFechaMasLejana = (eventos: Evento[]): string | null => {
    if (!eventos || eventos.length === 0) return null;

    // Ordenar eventos por fecha de realización (descendente)
    const eventosOrdenados = [...eventos].sort((a, b) => {
      const fechaA = new Date(a.fecha_realizacion).getTime();
      const fechaB = new Date(b.fecha_realizacion).getTime();
      return fechaB - fechaA; // Orden descendente para obtener la más lejana primero
    });

    // Retornar la fecha más lejana (la primera después de ordenar)
    return eventosOrdenados[0]?.fecha_realizacion || null;
  };

  // Cargar eventos del cliente solo al inicializar el componente
  useEffect(() => {
    const cargarEventos = async () => {
      if (cliente.id) {
        try {
          const eventosCliente = await fetchEventosByCliente(cliente.id);

          // Actualizar la fecha de recontacto con la más lejana
          const fechaMasLejana = obtenerFechaMasLejana(eventosCliente);
          if (fechaMasLejana) {
            setFechaRecontacto(fechaMasLejana);

            // Guardar la fecha de recontacto en la base de datos
            await updateFechaRecontacto(cliente.id, fechaMasLejana);
            console.log(
              `Fecha de recontacto actualizada para cliente ${cliente.id}: ${fechaMasLejana}`
            );
          }
        } catch (error) {
          console.error("Error al cargar eventos del cliente:", error);
        }
      }
    };

    // Solo cargar eventos una vez al inicializar el componente
    // Las actualizaciones posteriores vendrán a través de las props
    cargarEventos();
  }, []);

  return (
    <div>
      {isEditing ? (
        // Modo de edición - Mostrar componente EdicionCliente
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Editar información de cliente
            </h2>
          </div>
          <EdicionCliente 
            cliente={clienteLocal}
            clienteEditado={clienteEditado}
            vendedores={vendedores}
            setClienteEditado={setClienteEditado}
            onCancelar={() => {
              setClienteEditado({...cliente});
              setIsEditing(false);
            }}
            onGuardar={(clienteActualizado) => {
              // Actualizar el estado local con los datos actualizados
              setIsEditing(false);
              setClienteLocal(clienteActualizado);
              
              // Actualizar la fecha de recontacto si es necesario
              if (clienteActualizado.fecha_recontacto !== fechaRecontacto) {
                setFechaRecontacto(clienteActualizado.fecha_recontacto);
              }
              
              // Notificar al componente padre sobre la actualización
              if (onClienteActualizado) {
                onClienteActualizado(clienteActualizado);
              }
            }}
            vacio={vacio}
          />
        </div>
      ) : (
        // Modo de visualización
        <>
          {/* Encabezado con nombre del cliente */}
          <div>
            <div className="text-3xl font-bold mb-1 text-gray-800 max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
              {clienteLocal.nombre}
            </div>
            <div className="text-gray-600 mb-4 max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
              {clienteLocal.empleo || "Empleo No Proporcionado"}
            </div>
          </div>

          <div className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Información de Contacto
              </h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 font-medium py-2 px-4 rounded-md flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </button>
            </div>

            <div>
              {/* Descripción */}
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm mb-1">Descripción</h3>
                <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto max-h-60  p-1 rounded-md">
                  {clienteLocal.descripcion || vacio()}
                </div>
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Estado */}
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm mb-1">Estado</h3>
                {clienteLocal.estado ? (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ESTADO_CLIENTE_COLORS[clienteLocal.estado] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {clienteLocal.estado}
                  </span>
                ) : (
                  vacio()
                )}
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Temperatura */}
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm mb-1">Temperatura</h3>
                {clienteLocal.temperatura ? (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      TEMPERATURA_CLIENTE_COLORS[clienteLocal.temperatura] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {clienteLocal.temperatura}
                  </span>
                ) : (
                  vacio()
                )}
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Información de contacto */}
              <div className="flex flex-row justify-between w-full">
                <div className="mb-2 w-1/2 pr-2">
                  <h3 className="text-gray-500 text-sm">Teléfono</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    
                    {clienteLocal.telefono && !clienteLocal.telefono.startsWith('no-phone-') 
                      ? clienteLocal.telefono 
                      : vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/2 pl-2">
                  <h3 className="text-gray-500 text-sm">Correo Electrónico</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {clienteLocal.email || vacio()}
                  </div>
                </div>
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Información de vendedor */}
              <div className="flex flex-row justify-between w-full">
                <div className="mb-2 w-1/2 pr-2">
                  <h3 className="text-gray-500 text-sm">Creado por</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {clienteLocal.created_by || vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/2 pl-2">
                  <h3 className="text-gray-500 text-sm">Vendedor Asignado</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {getNombreVendedor(clienteLocal.vendedor_id)}
                  </div>
                </div>
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Tipo de cliente */}
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm mb-1">Tipo de cliente</h3>
                {clienteLocal.tipo_cliente ? (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      TIPO_CLIENTE_COLORS[clienteLocal.tipo_cliente] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {clienteLocal.tipo_cliente}
                  </span>
                ) : (
                  vacio()
                )}
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Información de ubicación */}
              <div className="flex flex-row justify-between w-full">
                <div className="mb-2 w-1/3 pr-2">
                  <h3 className="text-gray-500 text-sm">Ciudad</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {clienteLocal.ciudad || vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/3 px-2">
                  <h3 className="text-gray-500 text-sm">Barrio</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {clienteLocal.barrio || vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/3 pl-2">
                  <h3 className="text-gray-500 text-sm">País</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {clienteLocal.pais || vacio()}
                  </div>
                </div>
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>

              {/* Información de fecha */}
              <div className="flex flex-row justify-between w-full">
                <div className="mb-2 w-1/3 pr-2">
                  <h3 className="text-gray-500 text-sm">Fecha de creación</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {formatearFecha(clienteLocal.created_at) || vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/3 px-2">
                  <h3 className="text-gray-500 text-sm">Ultima interacción</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {formatearFecha(clienteLocal.ultima_interaccion, true) || vacio()}
                  </div>
                </div>
                <div className="mb-2 w-1/3 pl-2">
                  <h3 className="text-gray-500 text-sm">Fecha de recontacto</h3>
                  <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                    {formatearFecha(fechaRecontacto, true) || vacio()}
                  </div>
                </div>
              </div>
              <div className="border-b-2 border-gray-200 my-4"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
