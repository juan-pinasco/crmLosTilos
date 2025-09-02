import React, { useState, useEffect } from "react";
import type { Observacion } from "../../types/ObservationsType";
import type { Vendedor } from "../../types/SellersType";
import type { Cliente } from "../../types/ClientsType";
import { formatearFecha } from "../../utils/dateUtils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router";

interface ObservacionesTableProps {
  observaciones: Observacion[];
  vendedores: Vendedor[];
  clientes: Cliente[];
  getNombreVendedor: (vendedorId: string | null | undefined) => string;
  getNombreCliente: (clienteId: string) => string;
}

export const ObservacionesTable: React.FC<ObservacionesTableProps> = ({
  observaciones,
  vendedores,
  clientes,
  getNombreVendedor,
  getNombreCliente,
}) => {
  const navigate = useNavigate();
  const [filteredObservaciones, setFilteredObservaciones] = useState<Observacion[]>(observaciones);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [vendedorFilter, setVendedorFilter] = useState<string>("");
  const [clienteFilter, setClienteFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending" | null;
  }>({ key: "created_at", direction: "descending" });

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
    let result = [...observaciones];

    // Filtrar por vendedor seleccionado
    if (vendedorFilter) {
      result = result.filter(
        (obs) => obs.id_vendedor === vendedorFilter
      );
    }

    // Filtrar por cliente seleccionado
    if (clienteFilter) {
      result = result.filter(
        (obs) => obs.id_cliente === clienteFilter
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter((obs) => {
        // Buscar en observación
        if (
          obs.observacion &&
          obs.observacion.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        // Buscar en nombre de vendedor si está disponible
        const nombreVendedor = getNombreVendedor(obs.id_vendedor);
        if (
          nombreVendedor &&
          nombreVendedor.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        // Buscar en nombre de cliente si está disponible
        const nombreCliente = getNombreCliente(obs.id_cliente);
        if (
          nombreCliente &&
          nombreCliente.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        return false;
      });
    }

    // Ordenar las observaciones según la configuración actual
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        // Manejar fechas especialmente
        if (sortConfig.key === "created_at") {
          // Manejo seguro de fechas nulas
          const dateA = a[sortConfig.key as keyof Observacion]
            ? new Date(a[sortConfig.key as keyof Observacion] as string).getTime()
            : 0;
          const dateB = b[sortConfig.key as keyof Observacion]
            ? new Date(b[sortConfig.key as keyof Observacion] as string).getTime()
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
        if (sortConfig.key === "id_vendedor") {
          valueA = getNombreVendedor(a.id_vendedor);
          valueB = getNombreVendedor(b.id_vendedor);
        } else if (sortConfig.key === "id_cliente") {
          valueA = getNombreCliente(a.id_cliente);
          valueB = getNombreCliente(b.id_cliente);
        } else {
          valueA = a[sortConfig.key as keyof Observacion] || "";
          valueB = b[sortConfig.key as keyof Observacion] || "";
        }

        if (sortConfig.direction === "ascending") {
          return String(valueA).localeCompare(String(valueB));
        } else {
          return String(valueB).localeCompare(String(valueA));
        }
      });
    }

    setFilteredObservaciones(result);
  }, [
    observaciones,
    vendedorFilter,
    clienteFilter,
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
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en observaciones..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Filtro por vendedor */}
          <div>
            <label htmlFor="vendedor" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por vendedor
            </label>
            <select
              id="vendedor"
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id} title={vendedor.nombre}>
                  {vendedor.nombre.length > 20 ? `${vendedor.nombre.substring(0, 20)}...` : vendedor.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Filtro por cliente */}
          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por cliente
            </label>
            <select
              id="cliente"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id} className="" title={cliente.nombre}>
                  {cliente.nombre.length > 20 ? `${cliente.nombre.substring(0, 20)}...` : cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de observaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("created_at")}
                >
                  <div className="flex items-center">
                    <span>Fecha</span>{" "}
                    {getSortIcon("created_at")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("id_cliente")}
                >
                  <div className="flex items-center">
                    <span>Cliente</span> {getSortIcon("id_cliente")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-10 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("observacion")}
                >
                  <div className="flex items-center">
                    <span>Observación</span> {getSortIcon("observacion")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("id_vendedor")}
                >
                  <div className="flex items-center">
                    <span>Vendedor</span> {getSortIcon("id_vendedor")}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredObservaciones.length > 0 ? (
                filteredObservaciones.map((observacion: Observacion, index) => (
                  <tr
                    key={observacion.id || index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/profile-client/${observacion.id_cliente}`)}
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(observacion.created_at, true)}
                    </td>
                    <td
                      className="px-3 py-4 whitespace-nowrap break-words text-sm font-medium text-gray-900"
                      title={getNombreCliente(observacion.id_cliente) || ""}
                    >
                      {truncateText(getNombreCliente(observacion.id_cliente), 20)}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 break-words"
                      title={observacion.observacion || ""}
                    >
                      {truncateText(observacion.observacion, 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getNombreVendedor(observacion.id_vendedor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No hay observaciones disponibles
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

export default ObservacionesTable;
