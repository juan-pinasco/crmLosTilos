import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, CalendarRange } from "lucide-react";

interface TableHeaderProps {
  availableColumns: { key: string; label: string }[];
  selectedColumns: { [key: string]: boolean };
  sortConfig: { key: string; direction: 'ascending' | 'descending' | null };
  requestSort: (key: string) => void;
  dateFilters: { [key: string]: { from: string | null; to: string | null } };
  onApplyDateFilter: (key: string, range: { from: string | null; to: string | null }) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  availableColumns,
  selectedColumns,
  sortConfig,
  requestSort,
  dateFilters,
  onApplyDateFilter
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

  const [openPopover, setOpenPopover] = React.useState<string | null>(null);
  const [tempRange, setTempRange] = React.useState<{ from: string | null; to: string | null }>({ from: null, to: null });

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
              <div className="flex items-center whitespace-nowrap relative">
                <span>{column.label}</span> {getSortIcon(column.key)}
                {['ultima_interaccion','fecha_recontacto'].includes(column.key) && (
                  <>
                    <button
                      type="button"
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempRange(dateFilters[column.key] || { from: null, to: null });
                        setOpenPopover(openPopover === column.key ? null : column.key);
                      }}
                    >
                      <CalendarRange
                        size={16}
                        className={
                          dateFilters[column.key] && (dateFilters[column.key].from || dateFilters[column.key].to)
                            ? 'text-blue-600'
                            : ''
                        }
                      />
                    </button>
                    {openPopover === column.key && (
                      <div
                        className="absolute top-full left-0 mt-2 bg-white border rounded shadow p-4 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col space-y-2">
                          <label className="text-xs text-gray-600">Desde</label>
                          <input
                            type="date"
                            value={tempRange.from ?? ''}
                            onChange={(e) =>
                              setTempRange({ ...tempRange, from: e.target.value || null })
                            }
                            className="border rounded px-2 py-1"
                          />
                          <label className="text-xs text-gray-600 mt-2">Hasta</label>
                          <input
                            type="date"
                            value={tempRange.to ?? ''}
                            onChange={(e) =>
                              setTempRange({ ...tempRange, to: e.target.value || null })
                            }
                            className="border rounded px-2 py-1"
                          />
                          <div className="flex justify-end space-x-2 mt-3">
                            <button
                              onClick={() => {
                                onApplyDateFilter(column.key, tempRange);
                                setOpenPopover(null);
                              }}
                              className="text-blue-600 text-sm"
                            >
                              Aplicar
                            </button>
                            <button
                              onClick={() => {
                                onApplyDateFilter(column.key, { from: null, to: null });
                                setTempRange({ from: null, to: null });
                                setOpenPopover(null);
                              }}
                              className="text-gray-500 text-sm"
                            >
                              Limpiar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </th>
          )
        ))}
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
