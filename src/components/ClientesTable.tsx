import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trash, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { formatearFecha } from "../utils/dateUtils";
import { deleteClient } from "../data/ClientsCrud";
import { ESTADO_CLIENTE_COLORS } from "../constants/estadosCliente";
import { TEMPERATURA_CLIENTE_COLORS } from "../constants/temperaturasCliente";
import { TIPO_CLIENTE_COLORS } from "../constants/tiposCliente";

interface ClientesTableProps {
  clientes: Cliente[];
  vendedores: Vendedor[];
  onClienteDeleted: () => void;
  loading: boolean;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  vendedores,
  onClienteDeleted,
  loading
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({ key: '', direction: null });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<{[key: string]: boolean}>({});
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
  const navigate = useNavigate();

  // Definir las columnas disponibles para la tabla de clientes
  const availableColumns = [
    { key: 'ultima_interaccion', label: 'Última Interacción' },
    { key: 'fecha_recontacto', label: 'Fecha Recontacto' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'pais', label: 'País' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'barrio', label: 'Barrio' },
    { key: 'tipo_cliente', label: 'Tipo Cliente' },
    { key: 'estado', label: 'Estado' },
    { key: 'temperatura', label: 'Temperatura' },
    { key: 'vendedor_id', label: 'Vendedor Asignado' },
    { key: 'empleo', label: 'Empleo' }
  ];

  // Inicializar las columnas seleccionadas por defecto
  useEffect(() => {
    const initialSelectedColumns = {
      'ultima_interaccion': true,
      'fecha_recontacto': true,
      'nombre': true,
      'descripcion': true,
      'telefono': true,
      'estado': true,
      'temperatura': true,
      'vendedor_id': true
    };
    setSelectedColumns(initialSelectedColumns);
  }, []);

  // Función para obtener el nombre del vendedor por su ID.
  const getNombreVendedor = (vendedorAsignadoId: string) => {
    const vendedor = vendedores.find((v) => v.id === vendedorAsignadoId); 
    return vendedor ? vendedor.nombre : vendedorAsignadoId;
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
    onClienteDeleted();
  };

  // Función para manejar la ordenación de la tabla
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  // Función para obtener el ícono de ordenación según el estado actual
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="ml-1 inline-block flex-shrink-0" />;
    }
    
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp size={16} className="ml-1 inline-block flex-shrink-0 text-blue-600" />;
    }
    
    if (sortConfig.direction === 'descending') {
      return <ArrowDown size={16} className="ml-1 inline-block flex-shrink-0 text-blue-600" />;
    }
    
    return <ArrowUpDown size={16} className="ml-1 inline-block flex-shrink-0" />;
  };

  // Función para manejar cambios en los checkboxes de columnas
  const handleColumnChange = (columnKey: string) => {
    setSelectedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Filtrar clientes según el término de búsqueda y las columnas seleccionadas
  const filteredAndSortedClientes = React.useMemo(() => {
    let filteredClientes = [...clientes];
    
    if (searchTerm.trim() !== '') {
      filteredClientes = filteredClientes.filter(cliente => {
        return Object.keys(selectedColumns).some(key => {
          if (!selectedColumns[key]) return false;
          
          const value = cliente[key as keyof Cliente];
          if (value === null || value === undefined) return false;
          
          // Para el caso especial del vendedor_id, buscar por el nombre del vendedor
          if (key === 'vendedor_id') {
            const vendedorNombre = getNombreVendedor(value as string);
            return vendedorNombre.toLowerCase().includes(searchTerm.toLowerCase());
          }
          
          // Para fechas, formatear antes de buscar
          if (key === 'ultima_interaccion' || key === 'fecha_recontacto') {
            return formatearFecha(value as string, true).toLowerCase().includes(searchTerm.toLowerCase());
          }
          
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    // Ordenar los clientes según la configuración actual
    let sortableClientes = [...filteredClientes];
    if (sortConfig.key && sortConfig.direction) {
      sortableClientes.sort((a, b) => {
        // Manejar fechas especialmente
        if (sortConfig.key === 'ultima_interaccion' || sortConfig.key === 'fecha_recontacto') {
          // Manejo seguro de fechas nulas
          const dateA = a[sortConfig.key as keyof Cliente] ? new Date(a[sortConfig.key as keyof Cliente] as string).getTime() : 0;
          const dateB = b[sortConfig.key as keyof Cliente] ? new Date(b[sortConfig.key as keyof Cliente] as string).getTime() : 0;
          
          if (sortConfig.direction === 'ascending') {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        
        // Para otros tipos de datos
        const valueA = a[sortConfig.key as keyof Cliente] || '';
        const valueB = b[sortConfig.key as keyof Cliente] || '';
        
        // Caso especial para vendedor_id, usar el nombre del vendedor para ordenar
        if (sortConfig.key === 'vendedor_id') {
          const vendedorA = getNombreVendedor(valueA as string);
          const vendedorB = getNombreVendedor(valueB as string);
          
          if (sortConfig.direction === 'ascending') {
            return vendedorA.localeCompare(vendedorB);
          } else {
            return vendedorB.localeCompare(vendedorA);
          }
        }
        
        if (sortConfig.direction === 'ascending') {
          return String(valueA).localeCompare(String(valueB));
        } else {
          return String(valueB).localeCompare(String(valueA));
        }
      });
    }
    return sortableClientes;
  }, [clientes, sortConfig, searchTerm, selectedColumns, vendedores]);

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Buscador */}
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar en columnas seleccionadas..."
            className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Selector de columnas */}
        <div className="relative">
          <button 
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Seleccionar columnas
          </button>
          
          {showColumnSelector && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Columnas visibles:</h3>
              <div className="max-h-60 overflow-y-auto">
                {availableColumns.map((column) => (
                  <div key={column.key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`column-${column.key}`}
                      checked={!!selectedColumns[column.key]}
                      onChange={() => handleColumnChange(column.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`column-${column.key}`} className="ml-2 text-sm text-gray-700">
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {availableColumns.map(column => (
                  selectedColumns[column.key] && (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort(column.key)}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        <span>{column.label}</span> {getSortIcon(column.key)}
                      </div>
                    </th>
                  )
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedClientes.length > 0 ? (
                filteredAndSortedClientes.map((cliente: Cliente, index) => (
                  <tr 
                    key={cliente.id || index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/profile-client/${cliente.id}`)}
                  >
                    {selectedColumns['ultima_interaccion'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(cliente.ultima_interaccion, true)}
                      </td>
                    )}
                    {selectedColumns['fecha_recontacto'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.fecha_recontacto ? formatearFecha(cliente.fecha_recontacto, true) : '-'}
                      </td>
                    )}
                    {selectedColumns['nombre'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cliente.nombre}
                      </td>
                    )}
                    {selectedColumns['descripcion'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.descripcion}
                      </td>
                    )}
                    {selectedColumns['email'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.email}
                      </td>
                    )}
                    {selectedColumns['telefono'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.telefono}
                      </td>
                    )}
                    {selectedColumns['pais'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.pais}
                      </td>
                    )}
                    {selectedColumns['ciudad'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.ciudad}
                      </td>
                    )}
                    {selectedColumns['barrio'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.barrio}
                      </td>
                    )}
                    {selectedColumns['tipo_cliente'] && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            TIPO_CLIENTE_COLORS[cliente.tipo_cliente] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cliente.tipo_cliente}
                        </span>
                      </td>
                    )}
                    {selectedColumns['estado'] && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ESTADO_CLIENTE_COLORS[cliente.estado] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cliente.estado}
                        </span>
                      </td>
                    )}
                    {selectedColumns['temperatura'] && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            TEMPERATURA_CLIENTE_COLORS[cliente.temperatura] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cliente.temperatura}
                        </span>
                      </td>
                    )}
                    {selectedColumns['vendedor_id'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getNombreVendedor(cliente.vendedor_id)}
                      </td>
                    )}
                    {selectedColumns['empleo'] && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.empleo}
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que el evento de clic se propague a la fila
                          handleDeleteClient(cliente.id);
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
                    colSpan={Object.values(selectedColumns).filter(Boolean).length + 1}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No hay clientes disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
