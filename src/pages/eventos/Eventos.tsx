import { Header } from "../../components/Header";
import { useState, useEffect } from "react";
import type { Evento } from "../../types/EventsType";
import type { Vendedor } from "../../types/SellersType";
import type { Cliente } from "../../types/ClientsType";
import { useNavigate } from "react-router";
import { Trash } from "lucide-react";
import { fetchEventos, eliminarEvento } from "../../data/EventosCrud";
import { fetchVendedores } from "../../data/VendedoresCrud";
import { fetchClientes } from "../../data/ClientsCrud";
import { formatearFecha } from "../../utils/dateUtils";

export const Eventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    // Cargar vendedores
    const loadVendedores = async () => {
      try {
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }
      } catch (error) {
        console.error("Error al cargar vendedores:", error);
      }
    };

    // Cargar clientes
    const loadClientes = async () => {
      try {
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };

    // Cargar eventos
    const loadEventos = async () => {
      try {
        const eventosData = await fetchEventos();
        if (eventosData) {
          setEventos(eventosData);
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
    loadClientes();
    loadEventos();
  }, []);

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string) => {
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : "No asignado";
  };

  // Función para obtener el nombre del cliente por su ID
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nombre : "No asignado";
  };

  // Función para manejar la eliminación de un evento
  const handleDeleteEvento = async (id: string) => {
    setLoading(true);
    await eliminarEvento(id);
    const nuevosEventos = await fetchEventos();
    if (nuevosEventos) {
      setEventos(nuevosEventos);
    }
    setLoading(false);
  };

  // Función para obtener la clase de color según el estado de la tarea
  const getEstadoClass = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "en progreso":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Eventos</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/calendario-eventos")}
              className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Ver Calendario
            </button>
            <button
              onClick={() => navigate("/create-evento")}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Crear Evento
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha de Realización
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Título
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendedor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Creado por
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Descripción
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {eventos.length > 0 ? (
                  eventos.map((evento: Evento, index) => (
                    <tr 
                      key={evento.id || index}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(evento.fecha_realizacion, true)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {evento.titulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.cliente ? evento.cliente.nombre : getNombreCliente(evento.tarea_client_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.vendedor ? evento.vendedor.nombre : getNombreVendedor(evento.tarea_vendedor_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(evento.estado_tarea)}`}
                        >
                          {evento.estado_tarea || "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.created_by || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.descripcion || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que el evento de clic se propague
                            handleDeleteEvento(evento.id);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      No hay eventos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
