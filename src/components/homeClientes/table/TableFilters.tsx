import React from "react";
import { Search } from "lucide-react";
import type { Vendedor } from "../../../types/SellersType";
import ColumnSelector from "../table/ColumnSelector";

interface TableFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  vendedorFilter: string;
  setVendedorFilter: (vendedorId: string) => void;
  vendedores: Vendedor[];
  showColumnSelector: boolean;
  setShowColumnSelector: (show: boolean) => void;
  selectedColumns: { [key: string]: boolean };
  availableColumns: { key: string; label: string }[];
  handleColumnChange: (columnKey: string) => void;
  resetColumns: () => void;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  vendedorFilter,
  setVendedorFilter,
  vendedores,
  showColumnSelector,
  setShowColumnSelector,
  selectedColumns,
  availableColumns,
  handleColumnChange,
  resetColumns
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Filtro por vendedor */}
      <div className="relative w-full md:w-1/3">
        <select
          className="pl-4 pr-8 py-2 w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          value={vendedorFilter}
          onChange={(e) => setVendedorFilter(e.target.value)}
        >
          <option value="todos">Todos los vendedores</option>
          {vendedores.map((vendedor) => (
            <option key={vendedor.id} value={vendedor.id}>
              {vendedor.nombre}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative w-full md:w-2/3">
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
          className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Columnas
        </button>
        
        {showColumnSelector && (
          <ColumnSelector 
            selectedColumns={selectedColumns}
            availableColumns={availableColumns}
            handleColumnChange={handleColumnChange}
            resetColumns={resetColumns}
            onClose={() => setShowColumnSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TableFilters;
