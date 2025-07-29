import React, { useState, useEffect } from "react";
import type { Evento } from "../../../types/EventsType";
import type { Vendedor } from "../../../types/SellersType";
import { formatearFecha } from "../../../utils/dateUtils";
import { getEstadoClass } from "../../../constants/estadosTareas";
import { Trash, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router";
// Importación relativa con extensión explícita
import EventosFiltros from "./EventosFiltros.tsx";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import {
  ESTADOS_EVENTOS_KEY,
  VENDEDOR_EVENTOS_KEY,
  FECHA_DESDE_EVENTOS_KEY,
  FECHA_HASTA_EVENTOS_KEY,
  SEARCH_TERM_EVENTOS_KEY,
  SORT_CONFIG_EVENTOS_KEY,
} from "../../../constants/storageKeys";

interface EventosTableProps {
  eventos: Evento[];
  vendedores: Vendedor[];
  onDeleteEvento: (id: string) => void;
  getNombreVendedor: (vendedorId: string) => string;
  getNombreCliente: (clienteId: string) => string;
}

export const EventosTable: React.FC<EventosTableProps> = ({
  eventos,
  vendedores,
  onDeleteEvento,
  getNombreVendedor,
  getNombreCliente,
}) => {
  const navigate = useNavigate();
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>(eventos);
  const [estadosSeleccionados, setEstadosSeleccionados] = useLocalStorage<
    string[]
  >(ESTADOS_EVENTOS_KEY, []);
  const [vendedorSeleccionado, setVendedorSeleccionado] =
    useLocalStorage<string>(VENDEDOR_EVENTOS_KEY, "");
  const [fechaDesde, setFechaDesde] = useLocalStorage<string>(
    FECHA_DESDE_EVENTOS_KEY,
    ""
  );
  const [fechaHasta, setFechaHasta] = useLocalStorage<string>(
    FECHA_HASTA_EVENTOS_KEY,
    ""
  );
  const [searchTerm, setSearchTerm] = useLocalStorage<string>(
    SEARCH_TERM_EVENTOS_KEY,
    ""
  );
  const [sortConfig, setSortConfig] = useLocalStorage<{
    key: string;
    direction: "ascending" | "descending" | null;
  }>(SORT_CONFIG_EVENTOS_KEY, { key: "", direction: null });

  // Función para manejar la ordenación de la tabla
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Función para obtener el ícono de ordenación según el estado actual
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <ArrowUpDown size={16} className="ml-1 inline-block flex-shrink-0" />
      );
    }

    if (sortConfig.direction === "ascending") {
      return (
        <ArrowUp
          size={16}
          className="ml-1 inline-block flex-shrink-0 text-blue-600"
        />
      );
    }

    if (sortConfig.direction === "descending") {
      return (
        <ArrowDown
          size={16}
          className="ml-1 inline-block flex-shrink-0 text-blue-600"
        />
      );
    }

    return (
      <ArrowUpDown size={16} className="ml-1 inline-block flex-shrink-0" />
    );
  };

  useEffect(() => {
    let result = [...eventos];

    // Filtrar por estados seleccionados
    // Si no hay estados seleccionados, mostrar todos los eventos
    if (estadosSeleccionados.length > 0) {
      result = result.filter((evento) =>
        estadosSeleccionados.includes(evento.estado_tarea)
      );
    }

    // Filtrar por vendedor seleccionado
    if (vendedorSeleccionado) {
      result = result.filter(
        (evento) => evento.tarea_vendedor_id === vendedorSeleccionado
      );
    }

    // Filtrar por fecha desde
    if (fechaDesde) {
      // Crear fecha con la zona horaria de Argentina (inicio del día)
      const fechaDesdeObj = new Date(fechaDesde + "T00:00:00-03:00");
      result = result.filter((evento) => {
        if (!evento.fecha_realizacion) return false;
        // Crear fecha del evento con zona horaria de Argentina
        const fechaEvento = new Date(evento.fecha_realizacion);
        return fechaEvento >= fechaDesdeObj;
      });
    }

    // Filtrar por fecha hasta
    if (fechaHasta) {
      // Crear fecha con la zona horaria de Argentina (fin del día)
      const fechaHastaObj = new Date(fechaHasta + "T23:59:59-03:00");
      result = result.filter((evento) => {
        if (!evento.fecha_realizacion) return false;
        // Crear fecha del evento con zona horaria de Argentina
        const fechaEvento = new Date(evento.fecha_realizacion);
        return fechaEvento <= fechaHastaObj;
      });
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter((evento) => {
        // Buscar en título
        if (
          evento.titulo &&
          evento.titulo.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        // Buscar en descripción
        if (
          evento.descripcion &&
          evento.descripcion.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        // Buscar en nombre de vendedor si está disponible
        const nombreVendedor = getNombreVendedor(evento.tarea_vendedor_id);
        if (
          nombreVendedor &&
          nombreVendedor.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        // Buscar en nombre de cliente si está disponible
        if (evento.tarea_client_id) {
          const nombreCliente = getNombreCliente(evento.tarea_client_id);
          if (
            nombreCliente &&
            nombreCliente.toLowerCase().includes(searchTermLower)
          ) {
            return true;
          }
        }
        return false;
      });
    }

    // Ordenar los eventos según la configuración actual
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        // Manejar fechas especialmente
        if (sortConfig.key === "fecha_realizacion") {
          // Manejo seguro de fechas nulas
          const dateA = a[sortConfig.key as keyof Evento]
            ? new Date(a[sortConfig.key as keyof Evento] as string).getTime()
            : 0;
          const dateB = b[sortConfig.key as keyof Evento]
            ? new Date(b[sortConfig.key as keyof Evento] as string).getTime()
            : 0;

          if (sortConfig.direction === "ascending") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }

        // Para otros tipos de datos
        let valueA: any = "";
        let valueB: any = "";

        // Casos especiales para campos que requieren funciones de obtención
        if (sortConfig.key === "tarea_vendedor_id") {
          valueA = getNombreVendedor(a.tarea_vendedor_id);
          valueB = getNombreVendedor(b.tarea_vendedor_id);
        } else if (sortConfig.key === "tarea_client_id") {
          valueA = getNombreCliente(a.tarea_client_id);
          valueB = getNombreCliente(b.tarea_client_id);
        } else {
          valueA = a[sortConfig.key as keyof Evento] || "";
          valueB = b[sortConfig.key as keyof Evento] || "";
        }

        if (sortConfig.direction === "ascending") {
          return String(valueA).localeCompare(String(valueB));
        } else {
          return String(valueB).localeCompare(String(valueA));
        }
      });
    }

    setFilteredEventos(result);
  }, [
    eventos,
    estadosSeleccionados,
    vendedorSeleccionado,
    fechaDesde,
    fechaHasta,
    searchTerm,
    getNombreVendedor,
    getNombreCliente,
    sortConfig,
  ]);

  // Función para truncar texto y añadir puntos suspensivos
  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div>
      {/* Componente de filtros */}
      <div className="bg-white rounded-lg shadow mb-4">
        <EventosFiltros
          vendedores={vendedores}
          estadosSeleccionados={estadosSeleccionados}
          setEstadosSeleccionados={setEstadosSeleccionados}
          vendedorSeleccionado={vendedorSeleccionado}
          setVendedorSeleccionado={setVendedorSeleccionado}
          fechaDesde={fechaDesde}
          setFechaDesde={setFechaDesde}
          fechaHasta={fechaHasta}
          setFechaHasta={setFechaHasta}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSortConfig={setSortConfig}
        />
      </div>

      {/* Tabla de eventos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("fecha_realizacion")}
                >
                  <div className="flex items-center">
                    <span>Fecha a realizar</span>{" "}
                    {getSortIcon("fecha_realizacion")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("titulo")}
                >
                  <div className="flex items-center">
                    <span>Título</span> {getSortIcon("titulo")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("tarea_client_id")}
                >
                  <div className="flex items-center">
                    <span>Cliente</span> {getSortIcon("tarea_client_id")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-10 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("descripcion")}
                >
                  <div className="flex items-center">
                    <span>Descripción</span> {getSortIcon("descripcion")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("tarea_vendedor_id")}
                >
                  <div className="flex items-center">
                    <span>Ejecutor</span> {getSortIcon("tarea_vendedor_id")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("estado_tarea")}
                >
                  <div className="flex items-center">
                    <span>Estado</span> {getSortIcon("estado_tarea")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("created_by")}
                >
                  <div className="flex items-center">
                    <span>Creado por</span> {getSortIcon("created_by")}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEventos.length > 0 ? (
                filteredEventos.map((evento: Evento, index) => (
                  <tr
                    key={evento.id || index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/detalle-evento/${evento.id}`)}
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(evento.fecha_realizacion, false)}
                    </td>
                    <td
                      className="px-3 py-4 whitespace-nowrap break-words text-sm font-medium text-gray-900"
                      title={evento.titulo || ""}
                    >
                      {truncateText(evento.titulo, 15)}
                    </td>
                    <td
                      className="px-3 py-4 whitespace-nowrap text-sm text-gray-500"
                      title={
                        evento.cliente
                          ? evento.cliente.nombre
                          : getNombreCliente(evento.tarea_client_id)
                      }
                    >
                      {truncateText(
                        evento.cliente
                          ? evento.cliente.nombre
                          : getNombreCliente(evento.tarea_client_id),
                        15
                      )}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 break-words"
                      title={evento.descripcion || ""}
                    >
                      {truncateText(evento.descripcion, 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evento.vendedor
                        ? evento.vendedor.nombre
                        : getNombreVendedor(evento.tarea_vendedor_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(
                          evento.estado_tarea
                        )}`}
                      >
                        {evento.estado_tarea || "Pendiente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evento.created_by || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que el evento de clic se propague
                          onDeleteEvento(evento.id);
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
                    No hay tareas disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventosTable;
