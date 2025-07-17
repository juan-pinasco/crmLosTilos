import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TableHeaderProps {
  availableColumns: { key: string; label: string }[];
  selectedColumns: { [key: string]: boolean };
  sortConfig: { key: string; direction: 'ascending' | 'descending' | null };
  requestSort: (key: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  availableColumns,
  selectedColumns,
  sortConfig,
  requestSort
}) => {
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

  return (
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
  );
};

export default TableHeader;
