import React from "react";
import { X } from "lucide-react";

interface ColumnSelectorProps {
  selectedColumns: { [key: string]: boolean };
  availableColumns: { key: string; label: string }[];
  handleColumnChange: (columnKey: string) => void;
  resetColumns: () => void;
  onClose: () => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  selectedColumns,
  availableColumns,
  handleColumnChange,
  resetColumns,
  onClose
}) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-12 p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Columnas visibles:</h3>
        <button 
          onClick={onClose}
          className="cursor-pointer text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto mb-3">
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
      <div className="flex justify-between">
      <button
          onClick={onClose}
          className="cursor-pointer text-sm px-3 py-1 bg-green-200 text-gray-700 rounded hover:bg-green-300 transition-colors"
        >
          Aceptar
        </button>
        <button
          onClick={() => {resetColumns(); onClose();}}
          className="cursor-pointer text-sm px-3 py-1 bg-red-200 text-gray-700 rounded hover:bg-red-300 transition-colors"
        >
          Cancelar/Reiniciar
        </button>
        
      </div>
    </div>
  );
};

export default ColumnSelector;
