import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, CalendarRange, Bookmark } from "lucide-react";

interface TableHeaderProps {
  availableColumns: { key: string; label: string }[];
  selectedColumns: { [key: string]: boolean };
  sortConfig: { key: string; direction: "ascending" | "descending" | null };
  requestSort: (key: string) => void;
  dateFilters: { [key: string]: { from: string | null; to: string | null } };
  onApplyDateFilter: (
    key: string,
    range: { from: string | null; to: string | null }
  ) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  availableColumns,
  selectedColumns,
  sortConfig,
  requestSort,
  dateFilters,
  onApplyDateFilter,
}) => {
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

  const [openPopover, setOpenPopover] = React.useState<string | null>(null);
  const [tempRange, setTempRange] = React.useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {/* Columna para el marcador de fila */}
        <th
          scope="col"
          className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          <Bookmark size={16} />
        </th>
        {availableColumns.map(
          (column) =>
            selectedColumns[column.key] && (
              <th
                key={column.key}
                scope="col"
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort(column.key)}
              >
                <div className="flex justify-center items-center whitespace-pre-line relative">
                  <span>{column.label}</span> {getSortIcon(column.key)}
                  {["ultima_interaccion", "fecha_recontacto", "created_at"].includes(
                    column.key
                  ) && (
                    <>
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-blue-700 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTempRange(
                            dateFilters[column.key] || { from: null, to: null }
                          );
                          setOpenPopover(
                            openPopover === column.key ? null : column.key
                          );
                        }}
                      >
                        <CalendarRange
                          size={16}
                          className={
                            dateFilters[column.key] &&
                            (dateFilters[column.key].from ||
                              dateFilters[column.key].to)
                              ? "text-blue-600"
                              : ""
                          }
                        />
                      </button>
                      {openPopover === column.key && (
                        <div
                          className="fixed z-50 mt-2 bg-white border rounded shadow-xl p-4 min-w-[300px] transform -translate-y-full"
                          style={{
                            top: "50%",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-end">
                              <button
                                onClick={() => setOpenPopover(null)}
                                className="text-gray-500 hover:text-gray-800 text-sm cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                            <label className="text-xs text-gray-600">
                              Desde
                            </label>
                            <input
                              type="date"
                              value={tempRange.from ?? ""}
                              onChange={(e) =>
                                setTempRange({
                                  ...tempRange,
                                  from: e.target.value || null,
                                })
                              }
                              className="border rounded px-2 py-2"
                            />
                            <label className="text-xs text-gray-600 mt-2">
                              Hasta
                            </label>
                            <input
                              type="date"
                              value={tempRange.to ?? ""}
                              onChange={(e) =>
                                setTempRange({
                                  ...tempRange,
                                  to: e.target.value || null,
                                })
                              }
                              className="border rounded px-2 py-2"
                            />
                            <div className="flex justify-end space-x-8 mt-3">
                              <button
                                onClick={() => {
                                  onApplyDateFilter(column.key, tempRange);
                                  setOpenPopover(null);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                              >
                                Aplicar
                              </button>
                              <button
                                onClick={() => {
                                  onApplyDateFilter(column.key, {
                                    from: null,
                                    to: null,
                                  });
                                  setTempRange({ from: null, to: null });
                                  setOpenPopover(null);
                                }}
                                className="text-gray-500 hover:text-gray-800 text-sm cursor-pointer"
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
        )}
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        ></th>
      </tr>
    </thead>
  );
};

export default TableHeader;
