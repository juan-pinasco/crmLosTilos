import { Edit, Save, X, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import type { Evento } from "../../types/EventsType";
import { formatearFecha } from "../../utils/dateUtils";
import { fetchEventosByCliente } from "../../data/EventosCrud";
import { updateCliente, updateFechaRecontacto, updateUltimaInteraccion } from "../../data/ClientsCrud";
import { fetchObservacionesByClienteId } from "../../data/ObservacionesCrud";
import { ESTADO_CLIENTE_COLORS, obtenerEstadosCliente } from "../../constants/estadosCliente";
import { TEMPERATURA_CLIENTE_COLORS, TEMPERATURAS_CLIENTE } from "../../constants/temperaturasCliente";
import { TIPO_CLIENTE_COLORS, TIPOS_CLIENTE } from "../../constants/tiposCliente";

interface InformacionClienteInlineProps {
  cliente: Cliente;
  vendedores: Vendedor[];
  onClienteActualizado?: (clienteActualizado: Cliente) => void;
}

export const InformacionClienteInline = ({
  cliente,
  vendedores,
  onClienteActualizado,
}: InformacionClienteInlineProps) => {
  // Estado local para mantener una copia actualizada del cliente
  const [clienteLocal, setClienteLocal] = useState<Cliente>(cliente);
  const [fechaRecontacto, setFechaRecontacto] = useState<string | null>(
    cliente.fecha_recontacto
  );
  const [isEditing, setIsEditing] = useState(false);
  const [clienteEditado, setClienteEditado] = useState<Cliente>({ ...cliente });
  const [estadosConColores] = useState(obtenerEstadosCliente());
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [showTemperaturaDropdown, setShowTemperaturaDropdown] = useState(false);
  const [showTipoClienteDropdown, setShowTipoClienteDropdown] = useState(false);
  
  // Referencias para cerrar los dropdowns al hacer clic fuera de ellos
  const estadoDropdownRef = useRef<HTMLDivElement>(null);
  const temperaturaDropdownRef = useRef<HTMLDivElement>(null);
  const tipoClienteDropdownRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar los dropdowns al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target as Node)) {
        setShowEstadoDropdown(false);
      }
      if (temperaturaDropdownRef.current && !temperaturaDropdownRef.current.contains(event.target as Node)) {
        setShowTemperaturaDropdown(false);
      }
      if (tipoClienteDropdownRef.current && !tipoClienteDropdownRef.current.contains(event.target as Node)) {
        setShowTipoClienteDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Actualizar el estado local cuando cambie el cliente en las props
  useEffect(() => {
    setClienteLocal(cliente);
    setFechaRecontacto(cliente.fecha_recontacto);
    setClienteEditado({ ...cliente });
  }, [cliente]);

  // Función para mostrar texto vacío en gris claro
  const vacio = () => <span className="text-gray-400">Sin datos</span>;

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string | null | undefined) => {
    if (!vendedorId) return vacio();
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : vacio();
  };

  // Función para convertir fecha ISO a formato datetime-local
  const convertirADatetimeLocal = (isoDate: string): string => {
    if (!isoDate) return "";
    const fecha = new Date(isoDate);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const hours = String(fecha.getHours()).padStart(2, "0");
    const minutes = String(fecha.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // Cargar eventos y verificar observaciones del cliente al inicializar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      if (cliente.id) {
        try {
          // Cargar eventos
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

          // Verificar si el cliente tiene observaciones
          const observaciones = await fetchObservacionesByClienteId(cliente.id);
          
          // Si no hay observaciones, actualizar última interacción con fecha de creación
          if (!observaciones || observaciones.length === 0) {
            if (cliente.created_at) {
              await updateUltimaInteraccion(cliente.id, cliente.created_at);
              
              // Actualizar el estado local
              setClienteLocal({
                ...cliente,
                ultima_interaccion: cliente.created_at,
              });
              
              console.log(
                `Cliente sin observaciones. Última interacción actualizada con fecha de creación: ${cliente.created_at}`
              );
            }
          }
        } catch (error) {
          console.error("Error al cargar datos del cliente:", error);
        }
      }
    };

    // Solo cargar datos una vez al inicializar el componente
    cargarDatos();
  }, []);

  // Manejador para guardar los cambios
  const handleGuardarCambios = async () => {
    try {
      // Verificar si se modificó la fecha de creación
      const fechaCreacionModificada = clienteEditado.created_at !== cliente.created_at;
      
      const clienteActualizado = await updateCliente(cliente.id, clienteEditado);
      if (clienteActualizado) {
        // Si se modificó la fecha de creación, verificar si hay observaciones
        if (fechaCreacionModificada) {
          const observaciones = await fetchObservacionesByClienteId(cliente.id);
          
          // Si no hay observaciones, actualizar última interacción con la nueva fecha de creación
          if (!observaciones || observaciones.length === 0) {
            await updateUltimaInteraccion(cliente.id, clienteEditado.created_at);
            
            // Actualizar el cliente con la nueva última interacción
            clienteActualizado.ultima_interaccion = clienteEditado.created_at;
            
            console.log(
              `Fecha de creación modificada sin observaciones. Última interacción actualizada: ${clienteEditado.created_at}`
            );
          }
        }
        
        setClienteLocal(clienteActualizado);
        setIsEditing(false);
        
        // Actualizar la fecha de recontacto si es necesario
        if (clienteActualizado.fecha_recontacto !== fechaRecontacto) {
          setFechaRecontacto(clienteActualizado.fecha_recontacto);
        }

        // Notificar al componente padre sobre la actualización
        if (onClienteActualizado) {
          onClienteActualizado(clienteActualizado);
        }
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  // Función para comenzar a editar
  const startEditing = () => {
    setIsEditing(true);
  };

  // Función para cancelar la edición
  const cancelEditing = () => {
    setClienteEditado({ ...clienteLocal });
    setIsEditing(false);
  };

  // Renderizado condicional para cada campo
  const renderField = (label: string, content: React.ReactNode) => {
    return (
      <div className="mb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-gray-500 text-sm">{label}</h3>
        </div>
        <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="pt-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Información de Contacto
          </h2>
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="bg-blue-400 hover:bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-md flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Editar
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleGuardarCambios}
                className="bg-green-500 hover:bg-green-600 cursor-pointer text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                <Save size={16} className="mr-2" />
                Guardar
              </button>
              <button 
                onClick={cancelEditing}
                className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 font-medium py-2 px-4 rounded-md flex items-center"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div>
          {/* Nombre */}
          {renderField(
            "Nombre",
            isEditing ? (
              <input
                type="text"
                value={clienteEditado.nombre || ""}
                onChange={(e) => setClienteEditado({...clienteEditado, nombre: e.target.value})}
                className="w-full text-3xl font-bold mb-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="text-3xl font-bold mb-1 text-gray-800">
                {clienteLocal.nombre || vacio()}
              </div>
            )
          )}

          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Descripción */}
          {renderField(
            "Descripción General",
            isEditing ? (
              <textarea
                value={clienteEditado.descripcion || ""}
                onChange={(e) => setClienteEditado({...clienteEditado, descripcion: e.target.value})}
                className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            ) : (
              clienteLocal.descripcion || vacio()
            )
          )}
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Estado, Temperatura y Tipo de cliente en una misma fila */}
          <div className="flex flex-row justify-between w-full">
                {/* Estado */}
                <div className="mb-2 w-1/3 pr-2">
                  {renderField(
                    "Estado",
                    isEditing ? (
                      <div   ref={estadoDropdownRef}>
                        <div 
                          className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer"
                          onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
                        >
                          {clienteEditado.estado ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ESTADO_CLIENTE_COLORS[clienteEditado.estado] || "bg-gray-100 text-gray-800"
                            }`}>
                              {clienteEditado.estado}
                            </span>
                          ) : (
                            <span className="text-gray-500">Seleccionar estado</span>
                          )}
                          <ChevronDown size={16} />
                        </div>
                        
                        {showEstadoDropdown && (
                          <div className="absolute z-10 mt-1 w-auto bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {estadosConColores.map((estado) => (
                              <div 
                                key={estado.valor} 
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setClienteEditado({...clienteEditado, estado: estado.valor});
                                  setShowEstadoDropdown(false);
                                }}
                              >
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estado.color}`}>
                                  {estado.valor}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      clienteLocal.estado ? (
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
                      )
                    )
                  )}
                </div>

            {/* Temperatura */}
            <div className="mb-2 w-1/3 px-2">
              {renderField(
                "Temperatura",
                isEditing ? (
                  <div ref={temperaturaDropdownRef}>
                    <div 
                      className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer"
                      onClick={() => setShowTemperaturaDropdown(!showTemperaturaDropdown)}
                    >
                      {clienteEditado.temperatura ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          TEMPERATURA_CLIENTE_COLORS[clienteEditado.temperatura] || "bg-gray-100 text-gray-800"
                        }`}>
                          {clienteEditado.temperatura}
                        </span>
                      ) : (
                        <span className="text-gray-500">Seleccionar temperatura</span>
                      )}
                      <ChevronDown size={16} />
                    </div>
                    
                    {showTemperaturaDropdown && (
                      <div className="absolute z-10 mt-1 w-auto bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {TEMPERATURAS_CLIENTE.map((temperatura) => (
                          <div 
                            key={temperatura} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setClienteEditado({...clienteEditado, temperatura: temperatura});
                              setShowTemperaturaDropdown(false);
                            }}
                          >
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${TEMPERATURA_CLIENTE_COLORS[temperatura]}`}>
                              {temperatura}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  clienteLocal.temperatura ? (
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
                  )
                )
              )}
            </div>

            {/* Tipo de cliente */}
            <div className="mb-2 w-1/3 pl-2">
              {renderField(
                "Tipo de cliente",
                isEditing ? (
                  <div  ref={tipoClienteDropdownRef}>
                    <div 
                      className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer"
                      onClick={() => setShowTipoClienteDropdown(!showTipoClienteDropdown)}
                    >
                      {clienteEditado.tipo_cliente ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          TIPO_CLIENTE_COLORS[clienteEditado.tipo_cliente] || "bg-gray-100 text-gray-800"
                        }`}>
                          {clienteEditado.tipo_cliente}
                        </span>
                      ) : (
                        <span className="text-gray-500">Seleccionar tipo</span>
                      )}
                      <ChevronDown size={16} />
                    </div>
                    
                    {showTipoClienteDropdown && (
                      <div className="absolute z-10 mt-1 w-auto bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {TIPOS_CLIENTE.map((tipo) => (
                          <div 
                            key={tipo} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setClienteEditado({...clienteEditado, tipo_cliente: tipo});
                              setShowTipoClienteDropdown(false);
                            }}
                          >
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${TIPO_CLIENTE_COLORS[tipo]}`}>
                              {tipo}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  clienteLocal.tipo_cliente ? (
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
                  )
                )
              )}
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de contacto */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-2 w-1/2 pr-2">
              {renderField(
                "Teléfono",
                isEditing ? (
                  <input
                    type="text"
                    value={clienteEditado.telefono && clienteEditado.telefono.startsWith('no-phone-') ? '' : clienteEditado.telefono || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, telefono: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  clienteLocal.telefono &&
                  !clienteLocal.telefono.startsWith("no-phone-")
                    ? clienteLocal.telefono
                    : vacio()
                )
              )}
            </div>
            <div className="mb-2 w-1/2 pl-2">
              {renderField(
                "Correo Electrónico",
                isEditing ? (
                  <input
                    type="email"
                    value={clienteEditado.email || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, email: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  clienteLocal.email || vacio()
                )
              )}
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
              {renderField(
                "Vendedor Asignado",
                isEditing ? (
                  <select
                    value={clienteEditado.vendedor_id || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, vendedor_id: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar vendedor</option>
                    {vendedores.map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  getNombreVendedor(clienteLocal.vendedor_id)
                )
              )}
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de fecha */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-2 w-1/3 pr-2">
              {renderField(
                "Fecha de creación",
                isEditing ? (
                  <input
                    type="datetime-local"
                    value={convertirADatetimeLocal(clienteEditado.created_at)}
                    onChange={(e) => {
                      const fechaSeleccionada = e.target.value;
                      const fechaISO = fechaSeleccionada ? new Date(fechaSeleccionada).toISOString() : new Date().toISOString();
                      setClienteEditado({...clienteEditado, created_at: fechaISO});
                    }}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  formatearFecha(clienteLocal.created_at) || vacio()
                )
              )}
            </div>
            <div className="mb-2 w-1/3 px-2">
              <h3 className="text-gray-500 text-sm">Ultima interacción</h3>
              <div className="max-w-full break-words whitespace-pre-wrap overflow-y-auto p-1 rounded-md">
                {formatearFecha(clienteLocal.ultima_interaccion, true) ||
                  vacio()}
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

          {/* Empleo */}
          {renderField(
            "Ocupación",
            isEditing ? (
              <input
                type="text"
                value={clienteEditado.empleo || ""}
                onChange={(e) => setClienteEditado({...clienteEditado, empleo: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                placeholder="Empleo"
              />
            ) : (
              clienteLocal.empleo || vacio()
            )
          )}
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de ubicación */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-2 w-1/3 pr-2">
              {renderField(
                "Ciudad",
                isEditing ? (
                  <input
                    type="text"
                    value={clienteEditado.ciudad || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, ciudad: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  clienteLocal.ciudad || vacio()
                )
              )}
            </div>
            <div className="mb-2 w-1/3 px-2">
              {renderField(
                "Barrio",
                isEditing ? (
                  <input
                    type="text"
                    value={clienteEditado.barrio || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, barrio: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  clienteLocal.barrio || vacio()
                )
              )}
            </div>
            <div className="mb-2 w-1/3 pl-2">
              {renderField(
                "País",
                isEditing ? (
                  <input
                    type="text"
                    value={clienteEditado.pais || ""}
                    onChange={(e) => setClienteEditado({...clienteEditado, pais: e.target.value})}
                    className="w-full p-2 border rounded-md focus:ring-2 bg-white focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  clienteLocal.pais || vacio()
                )
              )}
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>
        </div>
      </div>
    </div>
  );
};
