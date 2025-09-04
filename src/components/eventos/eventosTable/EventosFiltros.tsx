import React, { useRef } from "react";
import type { Vendedor } from "../../../types/SellersType";
import { ESTADOS_TAREA, ESTADO_TAREA_COLORS } from "../../../constants/estadosTareas";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { formatearFecha } from "../../../utils/dateUtils";

interface EventosFiltrosProps {
  vendedores: Vendedor[];
  estadosSeleccionados: string[];
  setEstadosSeleccionados: (estados: string[]) => void;
  vendedorSeleccionado: string;
  setVendedorSeleccionado: (vendedorId: string) => void;
  fechaDesde: string;
  setFechaDesde: (fecha: string) => void;
  fechaHasta: string;
  setFechaHasta: (fecha: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSortConfig?: (value: { key: string; direction: 'ascending' | 'descending' | null }) => void;
}

const EventosFiltros: React.FC<EventosFiltrosProps> = ({
  vendedores,
  estadosSeleccionados,
  setEstadosSeleccionados,
  vendedorSeleccionado,
  setVendedorSeleccionado,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  searchTerm,
  setSearchTerm,
  setSortConfig,
}) => {
  const limpiarFiltros = () => {
    setEstadosSeleccionados([]);
    setVendedorSeleccionado("");
    setFechaDesde("");
    setFechaHasta("");
    setSearchTerm("");
    // También limpiar la configuración de ordenamiento si existe
    if (setSortConfig) {
      setSortConfig({ key: '', direction: null });
    }
  };

  // Manejar cambio en checkbox de estado
  const handleEstadoChange = (estado: string) => {
    if (estadosSeleccionados.includes(estado)) {
      // Si ya está seleccionado, lo quitamos
      setEstadosSeleccionados(estadosSeleccionados.filter((e) => e !== estado));
    } else {
      // Si no está seleccionado, lo agregamos
      setEstadosSeleccionados([...estadosSeleccionados, estado]);
    }
  };

  // Manejar cambio en dropdown de vendedor
  const handleVendedorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVendedorSeleccionado(e.target.value);
  };
  
  // Manejar cambio en fechas
  const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaDesde(e.target.value);
  };
  
  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaHasta(e.target.value);
  };
  
  
  // Manejar cambio en campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Referencias para los inputs de fecha
  const fechaDesdeRef = useRef<HTMLInputElement>(null);
  const fechaHastaRef = useRef<HTMLInputElement>(null);

  // Funciones para abrir el calendario al hacer clic en el campo
  const abrirCalendarioDesde = () => {
    if (fechaDesdeRef.current) {
      fechaDesdeRef.current.showPicker();
    }
  };

  const abrirCalendarioHasta = () => {
    if (fechaHastaRef.current) {
      fechaHastaRef.current.showPicker();
    }
  };

  // Función para obtener la clase de color para el checkbox
  const getCheckboxClass = (estado: string) => {
    const colorClass = ESTADO_TAREA_COLORS[estado.toLowerCase()] || ESTADO_TAREA_COLORS.default;
    // Extraer solo la clase de color de fondo
    const bgClass = colorClass.split(' ').find(cls => cls.startsWith('bg-')) || 'bg-gray-100';
    
    return estadosSeleccionados.includes(estado)
      ? `${bgClass} border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
      : 'bg-white border-gray-300 focus:ring-blue-500';
  };

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200 rounded-lg shadow-sm">
      <p className="text-lg font-bold">Filtros</p>
      <div className="flex flex-col space-y-3">
        {/* Fila superior: Estados y botón de limpiar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-x-auto">
            <div className="flex items-center mr-2">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Estados:</span>
              <span className="ml-1 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                {estadosSeleccionados.length === 0 ? 'Todos' : `${estadosSeleccionados.length}`}
              </span>
            </div>
            <div className="flex flex-nowrap gap-1.5">
              {ESTADOS_TAREA.map((estado) => (
                <label key={estado} className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    className={`cursor-pointer form-checkbox h-3 w-3 ${getCheckboxClass(estado)}`}
                    checked={estadosSeleccionados.includes(estado)}
                    onChange={() => handleEstadoChange(estado)}
                  />
                  <span className="ml-1.5 text-xs font-medium text-gray-700">{estado}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Botón limpiar filtros */}
          <button 
            onClick={limpiarFiltros}
            className="cursor-pointer flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs font-medium transition-colors ml-2 flex-shrink-0"
          >
            <RotateCcw size={14} className="mr-1" />
            Limpiar filtros
          </button>
        </div>
        
        {/* Fila inferior: fechas, búsqueda y ejecutor */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          {/* Fechas */}
          <div className="cursor-pointer border border-gray-300 rounded-md flex items-center space-x-2 flex-shrink-0">
            
            <input
              ref={fechaDesdeRef}
              type="date"
              value={fechaDesde}
              onChange={handleFechaDesdeChange}
              onClick={abrirCalendarioDesde}
              placeholder="Desde"
              className="cursor-pointer form-input block w-32 py-1.5 pl-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              title={fechaDesde ? formatearFecha(fechaDesde): "Seleccionar fecha inicial"}
            />
            <span className="text-gray-500">-</span>
            <input
              ref={fechaHastaRef}
              type="date"
              value={fechaHasta}
              onChange={handleFechaHastaChange}
              onClick={abrirCalendarioHasta}
              placeholder="Hasta"
              className="cursor-pointer form-input block w-32 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              title={fechaHasta ? formatearFecha(fechaHasta) : "Seleccionar fecha final"}
            />
          </div>
          
          {/* Búsqueda */}
          <div className="cursor-pointer border border-gray-300 rounded-md relative w-full md:w-150 mx-0 md:mx-3">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input block w-full pl-9 pr-3 py-1.5 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
          </div>
          
          {/* Dropdown de ejecutor */}
          <div className="relative w-full md:w-56 flex-shrink-0">
            <select
              value={vendedorSeleccionado}
              onChange={handleVendedorChange}
              className="cursor-pointer appearance-none block w-full px-3 py-1.5 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos los ejecutores</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventosFiltros;
