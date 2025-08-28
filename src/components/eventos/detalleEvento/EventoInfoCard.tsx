import React, { useRef, useEffect, useState } from "react";
import { Calendar, Tag, ChevronDown } from "lucide-react";
import type { Evento } from "../../../types/EventsType";
import { formatearFecha } from "../../../utils/dateUtils";
import { getEstadoClass, ESTADOS_TAREA } from "../../../constants/estadosTareas";

interface EventoInfoCardProps {
  evento: Evento;
  isEditing: boolean;
  editForm: {
    fecha_realizacion: string;
    estado_tarea: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const EventoInfoCard: React.FC<EventoInfoCardProps> = ({
  evento,
  isEditing,
  editForm,
  handleInputChange
}) => {
  // Estado para controlar la visibilidad del dropdown
  const [estadoDropdownOpen, setEstadoDropdownOpen] = useState(false);
  
  // Referencia para detectar clics fuera del dropdown
  const estadoDropdownRef = useRef<HTMLDivElement>(null);
  
  // Función para manejar la selección de estado
  const handleEstadoSelect = (estado: string) => {
    // Crear un evento sintético para mantener la compatibilidad con handleInputChange
    const syntheticEvent = {
      target: {
        name: "estado_tarea",
        value: estado
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
    setEstadoDropdownOpen(false);
  };
  
  // Efecto para cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target as Node)) {
        setEstadoDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
        <Calendar size={18} className="mr-2 text-blue-500" />
        Información de la Tarea
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <Calendar size={16} className="mr-2 text-gray-400" />
            Fecha de realización
          </div>
          {isEditing ? (
            <input
              type="datetime-local"
              name="fecha_realizacion"
              value={editForm.fecha_realizacion}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-800"
            />
          ) : (
            <p className="text-gray-800 font-medium">{formatearFecha(evento.fecha_realizacion, true)}</p>
          )}
        </div>
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <Tag size={16} className="mr-2 text-gray-400" />
            Estado
          </div>
          {isEditing ? (
            <div className="relative" ref={estadoDropdownRef}>
              <div 
                className="w-full border border-gray-300 rounded px-2 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => setEstadoDropdownOpen(!estadoDropdownOpen)}
              >
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEstadoClass(editForm.estado_tarea)}`}>
                  {editForm.estado_tarea}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>
              
              {estadoDropdownOpen && (
                <div className="absolute mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1 max-h-60 overflow-auto">
                    {ESTADOS_TAREA.map((estado) => (
                      <div
                        key={estado}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleEstadoSelect(estado)}
                      >
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEstadoClass(estado)}`}>
                          {estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoClass(evento.estado_tarea)}`}>
              {evento.estado_tarea}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
