import { useEffect, useCallback } from "react";
import { TIPOS_CLIENTE } from "../../constants/tiposCliente";
import { ESTADOS_CLIENTE } from "../../constants/estadosCliente";
import { TEMPERATURAS_CLIENTE } from "../../constants/temperaturasCliente";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Constante para la clave de localStorage
const FILTROS_STORAGE_KEY = 'clientesHome_filtros';

interface FiltrosClienteProps {
  onFiltrosChange: (filtros: FiltrosSeleccionados) => void;
  // Opcional: Filtros iniciales que pueden venir del componente padre
  initialFiltros?: FiltrosSeleccionados;
}

export interface FiltrosSeleccionados {
  tiposCliente: string[];
  estadosCliente: string[];
  temperaturasCliente: string[];
}

export const FiltrosCliente = ({ onFiltrosChange, initialFiltros }: FiltrosClienteProps) => {
  // Usar el hook useLocalStorage para manejar los filtros persistentes
  const [filtros, setFiltros] = useLocalStorage<FiltrosSeleccionados>(
    FILTROS_STORAGE_KEY,
    initialFiltros || {
      tiposCliente: [],
      estadosCliente: [],
      temperaturasCliente: []
    }
  );

  // Manejar cambios en los checkboxes de tipo de cliente
  const handleTipoClienteChange = useCallback((tipo: string, event?: React.MouseEvent) => {
    // Detener la propagación del evento para evitar interferencias con la navegación
    if (event) {
      event.stopPropagation();
    }
    
    setFiltros(prevFiltros => {
      const nuevosTipos = prevFiltros.tiposCliente.includes(tipo)
        ? prevFiltros.tiposCliente.filter(t => t !== tipo)
        : [...prevFiltros.tiposCliente, tipo];
      
      return {
        ...prevFiltros,
        tiposCliente: nuevosTipos
      };
    });
  }, [setFiltros]);

  // Manejar cambios en los checkboxes de estado de cliente
  const handleEstadoClienteChange = useCallback((estado: string, event?: React.MouseEvent) => {
    // Detener la propagación del evento para evitar interferencias con la navegación
    if (event) {
      event.stopPropagation();
    }
    
    setFiltros(prevFiltros => {
      const nuevosEstados = prevFiltros.estadosCliente.includes(estado)
        ? prevFiltros.estadosCliente.filter(e => e !== estado)
        : [...prevFiltros.estadosCliente, estado];
      
      return {
        ...prevFiltros,
        estadosCliente: nuevosEstados
      };
    });
  }, [setFiltros]);

  // Manejar cambios en los checkboxes de temperatura de cliente
  const handleTemperaturaClienteChange = useCallback((temperatura: string, event?: React.MouseEvent) => {
    // Detener la propagación del evento para evitar interferencias con la navegación
    if (event) {
      event.stopPropagation();
    }
    
    setFiltros(prevFiltros => {
      const nuevasTemperaturas = prevFiltros.temperaturasCliente.includes(temperatura)
        ? prevFiltros.temperaturasCliente.filter(t => t !== temperatura)
        : [...prevFiltros.temperaturasCliente, temperatura];
      
      return {
        ...prevFiltros,
        temperaturasCliente: nuevasTemperaturas
      };
    });
  }, [setFiltros]);

  // Notificar al componente padre cuando cambian los filtros
  useEffect(() => {
    // Notificar al componente padre
    onFiltrosChange(filtros);
  }, [filtros, onFiltrosChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full sticky top-4 max-w-xs">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Filtros</h2>
      
      <div className="flex flex-col gap-6">
       

        {/* Filtro por estado de cliente */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Estado</h3>
          <div className="space-y-2">
            {ESTADOS_CLIENTE.map(estado => (
              <label key={`estado-${estado}`} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={filtros.estadosCliente.includes(estado)}
                  onChange={(e) => handleEstadoClienteChange(estado, e.nativeEvent as unknown as React.MouseEvent)}
                />
                <span className="ml-2 text-gray-700">{estado}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por temperatura de cliente */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Temperatura</h3>
          <div className="space-y-2">
            {TEMPERATURAS_CLIENTE.map(temperatura => (
              <label key={`temperatura-${temperatura}`} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={filtros.temperaturasCliente.includes(temperatura)}
                  onChange={(e) => handleTemperaturaClienteChange(temperatura, e.nativeEvent as unknown as React.MouseEvent)}
                />
                <span className="ml-2 text-gray-700">{temperatura}</span>
              </label>
            ))}
          </div>
        </div>
         {/* Filtro por tipo de cliente */}
         <div>
          <h3 className="font-medium text-gray-700 mb-2">Tipo de Cliente</h3>
          <div className="space-y-2">
            {TIPOS_CLIENTE.map(tipo => (
              <label key={`tipo-${tipo}`} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={filtros.tiposCliente.includes(tipo)}
                  onChange={(e) => handleTipoClienteChange(tipo, e.nativeEvent as unknown as React.MouseEvent)}
                />
                <span className="ml-2 text-gray-700">{tipo}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Botón para limpiar todos los filtros */}
      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evitar que el evento se propague
            setFiltros({
              tiposCliente: [],
              estadosCliente: [],
              temperaturasCliente: []
            });
          }}
          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};
