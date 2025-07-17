import { Calendar, Check, X, Trash } from "lucide-react";
import type { Evento } from "../../../types/EventsType";
import { getEstadoClass } from "../../../constants/estadosTareas";

interface EventoItemProps {
  evento: Evento;
  onCambiarEstado: (eventoId: string, nuevoEstado: string) => void;
  onEliminarEvento: (eventoId: string) => void;
  formatearFecha: (fechaISO: string) => string;
}

export const EventoItem = ({ 
  evento, 
  onCambiarEstado, 
  onEliminarEvento, 
  formatearFecha 
}: EventoItemProps) => {
  // Función para obtener las clases de fondo para tarjetas según el estado
  const getEventoCardBgClass = (estado: string | null | undefined): string => {
    if (!estado) return 'bg-white';
    
    // Obtener la clase de color desde las constantes
    const colorClass = getEstadoClass(estado);
    
    // Extraer el color de fondo y convertirlo a una versión más clara para el fondo
    const bgMatch = colorClass.match(/bg-([a-z]+)-([0-9]+)/i);
    
    if (bgMatch) {
      const colorName = bgMatch[1];
      return `bg-${colorName}-50 border-${colorName}-200`;
    }
    
    return 'bg-white';
  };
  return (
    <div 
      className={`border rounded-lg p-4 ${getEventoCardBgClass(evento.estado_tarea)}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{evento.titulo}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Calendar size={14} className="mr-1" />
            {formatearFecha(evento.fecha_realizacion)}
          </div>
        </div>
        <div className="flex space-x-2">
          {evento.estado_tarea !== 'Completado' && (
            <button
              onClick={() => onCambiarEstado(evento.id, 'Completado')}
              className="text-green-600 hover:text-green-800"
              title="Marcar como completado"
            >
              <Check size={18} />
            </button>
          )}
          {evento.estado_tarea === 'Completado' && (
            <button
              onClick={() => onCambiarEstado(evento.id, 'Pendiente')}
              className="text-amber-600 hover:text-amber-800"
              title="Marcar como pendiente"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => onEliminarEvento(evento.id)}
            className="text-red-600 hover:text-red-800"
            title="Eliminar evento"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
      
      {evento.descripcion && (
        <p className="text-gray-600 mt-2 text-sm">{evento.descripcion}</p>
      )}
      
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-gray-600">
          Ejecutor: {evento.vendedor?.nombre || 'No asignado'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoClass(evento.estado_tarea)}`}>
          {evento.estado_tarea}
        </span>
      </div>
    </div>
  );
};
