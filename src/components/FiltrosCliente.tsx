import { useState, useEffect } from "react";
import { TIPOS_CLIENTE } from "../constants/tiposCliente";
import { ESTADOS_CLIENTE } from "../constants/estadosCliente";
import { TEMPERATURAS_CLIENTE } from "../constants/temperaturasCliente";

interface FiltrosClienteProps {
  onFiltrosChange: (filtros: FiltrosSeleccionados) => void;
}

export interface FiltrosSeleccionados {
  tiposCliente: string[];
  estadosCliente: string[];
  temperaturasCliente: string[];
}

export const FiltrosCliente = ({ onFiltrosChange }: FiltrosClienteProps) => {
  const [filtros, setFiltros] = useState<FiltrosSeleccionados>({
    tiposCliente: [],
    estadosCliente: [],
    temperaturasCliente: []
  });

  // Manejar cambios en los checkboxes de tipo de cliente
  const handleTipoClienteChange = (tipo: string) => {
    setFiltros(prevFiltros => {
      const nuevosTipos = prevFiltros.tiposCliente.includes(tipo)
        ? prevFiltros.tiposCliente.filter(t => t !== tipo)
        : [...prevFiltros.tiposCliente, tipo];
      
      return {
        ...prevFiltros,
        tiposCliente: nuevosTipos
      };
    });
  };

  // Manejar cambios en los checkboxes de estado de cliente
  const handleEstadoClienteChange = (estado: string) => {
    setFiltros(prevFiltros => {
      const nuevosEstados = prevFiltros.estadosCliente.includes(estado)
        ? prevFiltros.estadosCliente.filter(e => e !== estado)
        : [...prevFiltros.estadosCliente, estado];
      
      return {
        ...prevFiltros,
        estadosCliente: nuevosEstados
      };
    });
  };

  // Manejar cambios en los checkboxes de temperatura de cliente
  const handleTemperaturaClienteChange = (temperatura: string) => {
    setFiltros(prevFiltros => {
      const nuevasTemperaturas = prevFiltros.temperaturasCliente.includes(temperatura)
        ? prevFiltros.temperaturasCliente.filter(t => t !== temperatura)
        : [...prevFiltros.temperaturasCliente, temperatura];
      
      return {
        ...prevFiltros,
        temperaturasCliente: nuevasTemperaturas
      };
    });
  };

  // Notificar al componente padre cuando cambian los filtros
  useEffect(() => {
    onFiltrosChange(filtros);
  }, [filtros, onFiltrosChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full sticky top-4 max-w-xs">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Filtros</h2>
      
      <div className="flex flex-col gap-6">
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
                  onChange={() => handleTipoClienteChange(tipo)}
                />
                <span className="ml-2 text-gray-700">{tipo}</span>
              </label>
            ))}
          </div>
        </div>

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
                  onChange={() => handleEstadoClienteChange(estado)}
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
                  onChange={() => handleTemperaturaClienteChange(temperatura)}
                />
                <span className="ml-2 text-gray-700">{temperatura}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Botón para limpiar todos los filtros */}
      <div className="mt-6">
        <button
          onClick={() => setFiltros({
            tiposCliente: [],
            estadosCliente: [],
            temperaturasCliente: []
          })}
          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};
