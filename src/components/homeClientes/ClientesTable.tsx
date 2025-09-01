import React, { useState, useEffect, useMemo } from "react";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import { deleteClient } from "../../data/ClientsCrud";
import { formatearFecha } from "../../utils/dateUtils";

// Importar hook personalizado
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Importar componentes refactorizados
import TableFilters from "./table/TableFilters";
import TableHeader from "./table/TableHeader";
import TableRow from "./table/TableRow";
import LoadingSpinner from "./table/LoadingSpinner";
import EmptyState from "./table/EmptyState";

// Constantes para las claves de localStorage
const STORAGE_KEYS = {
  SORT_CONFIG: 'clientesTable_sortConfig',
  SEARCH_TERM: 'clientesTable_searchTerm',
  SELECTED_COLUMNS: 'clientesTable_selectedColumns',
  VENDEDOR_FILTER: 'clientesTable_vendedorFilter',
  DATE_FILTERS: 'clientesTable_dateFilters'
};

interface ClientesTableProps {
  clientes: Cliente[];
  vendedores: Vendedor[];
  pendientesMap: Map<string, number>;
  onClienteDeleted: () => void;
  loading: boolean;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  vendedores,
  pendientesMap,
  onClienteDeleted,
  loading
}) => {
  // Usar el hook useLocalStorage para manejar estados persistentes
  const [sortConfig, setSortConfig] = useLocalStorage<{ key: string; direction: 'ascending' | 'descending' | null }>(
    STORAGE_KEYS.SORT_CONFIG, 
    { key: '', direction: null }
  );
  
  const [searchTerm, setSearchTerm] = useLocalStorage<string>(
    STORAGE_KEYS.SEARCH_TERM, 
    ''
  );
  
  const [selectedColumns, setSelectedColumns] = useState<{[key: string]: boolean}>({});
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
  
  const [vendedorFilter, setVendedorFilter] = useLocalStorage<string>(
    STORAGE_KEYS.VENDEDOR_FILTER, 
    'todos'
  );

  // Filtros de rango de fechas por columna
  const [dateFilters, setDateFilters] = useLocalStorage<{ [key: string]: { from: string | null; to: string | null } }>(
    STORAGE_KEYS.DATE_FILTERS,
    {}
  );

  const handleApplyDateFilter = (key: string, range: { from: string | null; to: string | null }) => {
    setDateFilters(prev => ({ ...prev, [key]: range }));
  };

  // Definir las columnas disponibles para la tabla de clientes
  const availableColumns = [
    { key: 'ultima_interaccion', label: 'Última\nInteracción' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'pais', label: 'País' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'barrio', label: 'Barrio' },
    { key: 'tipo_cliente', label: 'Tipo Cliente' },
    { key: 'estado', label: 'Estado' },
    { key: 'temperatura', label: 'Temperatura' },
    { key: 'fecha_recontacto', label: 'Fecha a\ncontactar' },
    { key: 'vendedor_id', label: 'Vendedor Asignado' },
    { key: 'empleo', label: 'Empleo' }
  ];

  // Definir las columnas seleccionadas por defecto
  const defaultSelectedColumns = {
    'ultima_interaccion': true,
    'fecha_recontacto': true,
    'nombre': true,
    'descripcion': true,
    'telefono': true,
    'estado': true,
    'temperatura': true,
    'vendedor_id': true
  };

  // Inicializar las columnas seleccionadas usando useLocalStorage
  const [persistedColumns, setPersistedColumns] = useLocalStorage<{[key: string]: boolean}>(
    STORAGE_KEYS.SELECTED_COLUMNS, 
    defaultSelectedColumns
  );
  
  // Sincronizar el estado local con el estado persistido
  useEffect(() => {
    setSelectedColumns(persistedColumns);
  }, [persistedColumns]);

  // Función para reiniciar las columnas a su estado inicial
  const resetColumns = () => {
    setSelectedColumns({...defaultSelectedColumns});
    setPersistedColumns({...defaultSelectedColumns});
  };

  // Función para obtener el nombre del vendedor por su ID.
  const getNombreVendedor = (vendedorAsignadoId: string) => {
    const vendedor = vendedores.find((v) => v.id === vendedorAsignadoId); 
    return vendedor ? vendedor.nombre : vendedorAsignadoId;
  };

  const handleDeleteClient = async (id: string) => {
    const resultado = await deleteClient(id);
    if (resultado) {
      onClienteDeleted();
    }
    // No necesitamos mostrar mensajes de error aquí porque
    // la función deleteClient ya maneja las notificaciones con SweetAlert2
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

  // Función para manejar cambios en los checkboxes de columnas
  const handleColumnChange = (columnKey: string) => {
    const newColumns = {
      ...selectedColumns,
      [columnKey]: !selectedColumns[columnKey]
    };
    setSelectedColumns(newColumns);
    setPersistedColumns(newColumns);
  };

  // Filtrar clientes según el término de búsqueda, las columnas seleccionadas y el vendedor seleccionado
  const filteredAndSortedClientes = useMemo(() => {
    let filteredClientes = [...clientes];
    
    // Filtrar por vendedor asignado si se ha seleccionado uno específico
    if (vendedorFilter !== 'todos') {
      filteredClientes = filteredClientes.filter(cliente => cliente.vendedor_id === vendedorFilter);
    }
    
    // Filtrar por término de búsqueda
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

    // Aplicar filtros de rango de fechas
    // Función utilitaria para convertir 'YYYY-MM-DD' a timestamp local (00:00 hora local)
    const toLocalTimestamp = (dateInput: string): number => {
      const [y, m, d] = dateInput.split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    };

    Object.entries(dateFilters).forEach(([key, { from, to }]) => {
      if (from || to) {
        filteredClientes = filteredClientes.filter(cliente => {
          const dateStr = cliente[key as keyof Cliente] as string | null | undefined;
          if (!dateStr) return false;
          const time = new Date(dateStr).getTime(); // El valor en la base ya incluye zona horaria.
          if (from && time < toLocalTimestamp(from)) return false;
          if (to && time > toLocalTimestamp(to) + 24 * 60 * 60 * 1000 - 1) return false; // inclusivo hasta fin del día
          return true;
        });
      }
    });
    
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
  }, [clientes, sortConfig, searchTerm, selectedColumns, vendedores, vendedorFilter, dateFilters]);

  return (
    <>
      <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        vendedorFilter={vendedorFilter}
        setVendedorFilter={setVendedorFilter}
        vendedores={vendedores}
        showColumnSelector={showColumnSelector}
        setShowColumnSelector={setShowColumnSelector}
        selectedColumns={selectedColumns}
        availableColumns={availableColumns}
        handleColumnChange={handleColumnChange}
        resetColumns={resetColumns}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto overflow-y-auto  shadow-md rounded-lg h-auto max-h-[calc(100vh-175px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader
              availableColumns={availableColumns}
              selectedColumns={selectedColumns}
              sortConfig={sortConfig}
              requestSort={requestSort}
              dateFilters={dateFilters}
              onApplyDateFilter={handleApplyDateFilter}
            />

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedClientes.length > 0 ? (
                filteredAndSortedClientes.map((cliente: Cliente, index) => (
                  <TableRow
                    key={cliente.id || index}
                    cliente={cliente}
                    pendientes={pendientesMap.get(cliente.id) || 0}
                    selectedColumns={selectedColumns}
                    getNombreVendedor={getNombreVendedor}
                    handleDeleteClient={handleDeleteClient}
                    index={index}
                  />
                ))
              ) : (
                <EmptyState
                  columnsCount={Object.values(selectedColumns).filter(Boolean).length}
                />
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
